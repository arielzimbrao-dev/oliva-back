import { Injectable, Logger, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { PlanRepository } from '../entities/repository/plan.entity';
import { ConfigService } from '@nestjs/config';
import { ChurchRepository } from 'src/entities/repository/church.repository';
import { PaymentSessionRepository } from '../entities/repository/payment-session.repository';
import { ChurchSubscriptionRepository } from '../entities/repository/church-subscription.repository';
import { EmailService } from '../modules/email/email.service';
import { PaymentSession } from '../entities/payment-session.entity';
import { DataSource } from 'typeorm';
import { StripeCheckoutSession, StripeSubscription, StripeInvoice, getEventData } from './dtos/stripe-webhook.types';
import { PlanNotFoundError, ChurchNotFoundError } from '../common/exceptions/exception';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly churchRepository: ChurchRepository,
    private readonly configService: ConfigService,
    private readonly paymentSessionRepository: PaymentSessionRepository,
    private readonly churchSubscriptionRepository: ChurchSubscriptionRepository,
    private readonly emailService: EmailService,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });
  }

  /**
   * Helper method to find the latest payment session by churchId and planId
   */
  async findLatestPaymentSession(churchId: string, planId: string): Promise<PaymentSession | null> {
    return await this.paymentSessionRepository.findLatestByChurchAndPlan(churchId, planId);
  }

  /**
   * Helper method to find the latest church subscription by churchId
   * Returns the current active subscription regardless of plan
   */
  async findLatestChurchSubscription(churchId: string) {
    return await this.churchSubscriptionRepository.findLatestByChurchId(churchId);
  }

  async createStripeSession(planId: string, churchId: string): Promise<Stripe.Checkout.Session> {
    // Buscar plano pelo planId
    const plan = await this.planRepository.findOneById(planId);
    if (!plan) {
      throw new PlanNotFoundError();
    }

    const church = await this.churchRepository.findOneById(churchId);
    if (!church) {
      throw new ChurchNotFoundError();
    }

    const currency = church.preferredCurrency || 'USD';
    let amount = 0;
    if (currency === 'USD') {
      amount = Math.round(Number(plan.amountDolar) * 100);
    } else if (currency === 'EUR') {
      amount = Math.round(Number(plan.amountEuro) * 100);
    } else {
      amount = Math.round(Number(plan.amountReal) * 100);
    }

    // Find or create Stripe customer for this church
    let customerId: string | undefined;
    const existingSubscription = await this.churchSubscriptionRepository.findActiveByChurchId(churchId);

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
      this.logger.log(`Using existing Stripe customer: ${customerId}`);
    }

    // Create Stripe session with SUBSCRIPTION mode
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: churchId, // Reconcile session with internal system
      customer_email: church.email, // Pre-fill customer email
      metadata: {
        planId,
        churchId,
      },
      subscription_data: {
        metadata: {
          planId,
          churchId,
        },
      },
      ui_mode: 'embedded',
      return_url: `${this.configService.get<string>('FRONTEND_URL')}/settings?session_id={CHECKOUT_SESSION_ID}`,
    };

    // Add existing customer if found
    if (customerId) {
      sessionConfig.customer = customerId;
    }

    const session = await this.stripe.checkout.sessions.create(sessionConfig);

    // Save PaymentSession
    await this.paymentSessionRepository.create({
      planId,
      churchId,
      sessionId: session.id,
      status: 'pending',
    });

    this.logger.log(`Created checkout session ${session.id} for church ${churchId} (customer: ${session.customer || 'new'})`);
    return session;
  }

  /**
   * CHECKOUT.SESSION.COMPLETED - Main handler for subscription creation
   */
  async handleCheckoutSessionCompleted(
    event: Stripe.Event,
    metadata: { churchId?: string; planId?: string },
    churchSubscription: any,
    paymentSession: PaymentSession | null
  ): Promise<void> {
    const session = getEventData<StripeCheckoutSession>(event);
    
    this.logger.log(`Processing checkout.session.completed: ${session.id}`);

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find payment_session by sessionId + status='pending'
      const paymentSession = await this.paymentSessionRepository.findBySessionId(session.id, 'pending');

      if (!paymentSession) {
        this.logger.warn(`Payment session not found or already processed: ${session.id}`);
        await queryRunner.rollbackTransaction();
        return;
      }

      // 3. Get subscription details from Stripe
      const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

      // 4. Get plan details
      const plan = await this.planRepository.findOneById(paymentSession.planId);
      if (!plan) {
        this.logger.error(`Plan not found: ${paymentSession.planId}`);
        throw new PlanNotFoundError();
      }

      // 5. Create church_subscription
      const churchSubscription = await this.churchSubscriptionRepository.create({
        churchId: paymentSession.churchId,
        planId: paymentSession.planId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        status: 'active',
        amount: plan.amountDolar, // Adjust based on currency
        currency: session.currency?.toUpperCase() || 'USD',
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      } as any);

      this.logger.log(`Created church subscription: ${churchSubscription.id}`);

      // 6. Update payment_session status to 'created' (will be activated on first invoice.paid)
      await this.paymentSessionRepository.update(paymentSession.id, { 
        status: 'created' 
      });

      await queryRunner.commitTransaction();
      this.logger.log(`Successfully processed checkout.session.completed for church ${paymentSession.churchId}`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error processing checkout.session.completed:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * CHECKOUT.SESSION.EXPIRED - Session expired without completion
   */
  async handleCheckoutSessionExpired(
    event: Stripe.Event,
    metadata: { churchId?: string; planId?: string },
    churchSubscription: any,
    paymentSession: PaymentSession | null
  ): Promise<void> {
    const session = getEventData<StripeCheckoutSession>(event);
    
    this.logger.log(`Processing checkout.session.expired: ${session.id}`);

    // Use paymentSession passed from controller or fallback to query
    let paymentSessionToExpire = paymentSession;
    if (!paymentSessionToExpire) {
      paymentSessionToExpire = await this.paymentSessionRepository.findBySessionId(session.id, 'pending');
    }

    if (paymentSessionToExpire && paymentSessionToExpire.status === 'pending') {
      await this.paymentSessionRepository.update(paymentSessionToExpire.id, { 
        status: 'expired' 
      });

      this.logger.log(`Expired payment session: ${session.id}`);
    }
  }

  /**
   * CUSTOMER.SUBSCRIPTION.UPDATED - Update period_end, status
   */
  async handleSubscriptionUpdated(
    event: Stripe.Event,
    metadata: { churchId?: string; planId?: string },
    churchSubscription: any,
    paymentSession: PaymentSession | null
  ): Promise<void> {
    const subscription = getEventData<StripeSubscription>(event);
    
    this.logger.log(`Processing subscription.updated: ${subscription.id}`);
    this.logger.log(`Subscription status: ${subscription.status}`);
    this.logger.log(`Subscription current_period_end: ${subscription.current_period_end}`);
    this.logger.log(`Subscription metadata: ${JSON.stringify(subscription.metadata)}`);

    // Use churchSubscription passed from controller or fallback to query
    let foundChurchSubscription = churchSubscription;
    
    if (!foundChurchSubscription) {
      // Find church_subscription by stripeSubscriptionId OR by metadata
      foundChurchSubscription = await this.churchSubscriptionRepository.findByStripeSubscriptionId(subscription.id);

      // Fallback: try to find by churchId from metadata
      if (!foundChurchSubscription && subscription.metadata?.churchId) {
        this.logger.log(`Trying to find subscription by churchId from metadata: ${subscription.metadata.churchId}`);
        foundChurchSubscription = await this.churchSubscriptionRepository.findByChurchAndPlanAndStatus(
          subscription.metadata.churchId,
          subscription.metadata.planId,
          'active'
        );
      }
    }

    // If found, update with Stripe subscription ID if missing
    if (foundChurchSubscription && !foundChurchSubscription.stripeSubscriptionId) {
      await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
        stripeSubscriptionId: subscription.id
      });
      this.logger.log(`Updated church subscription ${foundChurchSubscription.id} with stripeSubscriptionId: ${subscription.id}`);
    }

    if (!foundChurchSubscription) {
      this.logger.warn(`Church subscription not found for Stripe subscription: ${subscription.id}`);
      return;
    }

    // Update subscription details - validate timestamps before creating Date objects
    const updateData: any = {
      status: subscription.status === 'active' ? 'active' : 
              subscription.status === 'past_due' ? 'past_due' :
              subscription.status === 'canceled' ? 'canceled' : 'expired',
    };

    // Only set currentPeriodEnd if the timestamp is valid
    if (subscription.current_period_end && !isNaN(subscription.current_period_end)) {
      updateData.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }

    // Only set cancelAt if the timestamp exists and is valid
    if (subscription.cancel_at && !isNaN(subscription.cancel_at)) {
      updateData.cancelAt = new Date(subscription.cancel_at * 1000);
    }

    // Only set canceledAt if the timestamp exists and is valid
    if (subscription.canceled_at && !isNaN(subscription.canceled_at)) {
      updateData.canceledAt = new Date(subscription.canceled_at * 1000);
    }

    await this.churchSubscriptionRepository.update(foundChurchSubscription.id, updateData);

    this.logger.log(`Updated church subscription ${foundChurchSubscription.id} to status: ${subscription.status}`);
  }

  /**
   * CUSTOMER.SUBSCRIPTION.DELETED - Cancel subscription
   */
  async handleSubscriptionDeleted(
    event: Stripe.Event,
    metadata: { churchId?: string; planId?: string },
    churchSubscription: any,
    paymentSession: PaymentSession | null
  ): Promise<void> {
    const subscription = getEventData<StripeSubscription>(event);
    this.logger.log('Subscription updated: ' + subscription);
    
    this.logger.log(`Processing subscription.deleted: ${subscription.id}`);
    this.logger.log(`Subscription metadata: ${JSON.stringify(subscription.metadata)}`);

    // Use churchSubscription passed from controller or fallback to query
    let foundChurchSubscription = churchSubscription;
    
    if (!foundChurchSubscription) {
      // Find church_subscription by stripeSubscriptionId OR by metadata
      foundChurchSubscription = await this.churchSubscriptionRepository.findByStripeSubscriptionId(subscription.id);

      // Fallback: try to find by churchId from metadata
      if (!foundChurchSubscription && subscription.metadata?.churchId) {
        this.logger.log(`Trying to find subscription by churchId from metadata: ${subscription.metadata.churchId}`);
        foundChurchSubscription = await this.churchSubscriptionRepository.findByChurchAndPlanAndStatus(
          subscription.metadata.churchId,
          subscription.metadata.planId,
          'active'
        );
      }
    }

    if (!foundChurchSubscription) {
      this.logger.warn(`Church subscription not found for Stripe subscription: ${subscription.id}`);
      return;
    }

    await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    this.logger.log(`Canceled church subscription: ${foundChurchSubscription.id}`);
  }

  /**
   * INVOICE.PAID - Monthly charge successful
   */
  async handleInvoicePaid(
    event: Stripe.Event,
    metadata: { churchId?: string; planId?: string },
    churchSubscription: any,
    paymentSession: PaymentSession | null
  ): Promise<void> {
    const invoice = getEventData<StripeInvoice>(event);
    this.logger.log('Subscription updated: ' + invoice);
    
    this.logger.log(`Processing invoice.paid: ${invoice.id}`);

    // Extract subscription ID from various locations in invoice
    const subscriptionId = (invoice.subscription as string) || 
                          (invoice as any).parent?.subscription_details?.subscription ||
                          (invoice as any).lines?.data?.[0]?.parent?.subscription_item_details?.subscription;

    if (!subscriptionId) {
      this.logger.warn(`Invoice ${invoice.id} has no subscription - skipping`);
      return;
    }

    this.logger.log(`Found subscription ID: ${subscriptionId}`);

    // Use churchSubscription passed from controller or fallback to query
    let foundChurchSubscription = churchSubscription;
    
    if (!foundChurchSubscription) {
      // Find church_subscription by stripeSubscriptionId
      foundChurchSubscription = await this.churchSubscriptionRepository.findByStripeSubscriptionId(subscriptionId);

      // Fallback: retrieve subscription from Stripe to get metadata
      if (!foundChurchSubscription) {
        try {
          const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
          if (subscription.metadata?.churchId) {
            this.logger.log(`Trying to find subscription by churchId from Stripe metadata: ${subscription.metadata.churchId}`);
            foundChurchSubscription = await this.churchSubscriptionRepository.findByChurchAndPlan(
              subscription.metadata.churchId,
              subscription.metadata.planId
            );
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve subscription from Stripe: ${subscriptionId}`, error);
        }
      }
    }

    // Update with Stripe subscription ID if missing
    if (foundChurchSubscription && !foundChurchSubscription.stripeSubscriptionId) {
      await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
        stripeSubscriptionId: subscriptionId
      });
      this.logger.log(`Updated church subscription ${foundChurchSubscription.id} with stripeSubscriptionId: ${subscriptionId}`);
    }

    if (!foundChurchSubscription) {
      this.logger.warn(`Church subscription not found for invoice: ${invoice.id}`);
      return;
    }

    // Use paymentSession passed from controller or query if needed
    let pendingPaymentSession = paymentSession;
    if (!pendingPaymentSession || pendingPaymentSession.status !== 'created') {
      // Check if there's a payment_session with status 'created' waiting to be activated
      pendingPaymentSession = await this.paymentSessionRepository.findLatestByChurchAndPlanAndStatus(
        foundChurchSubscription.churchId,
        foundChurchSubscription.planId,
        'created'
      );
    }

    if (pendingPaymentSession && pendingPaymentSession.status === 'created') {
      // First invoice paid - activate subscription and complete payment session
      await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
        status: 'active',
      });
      
      await this.paymentSessionRepository.update(pendingPaymentSession.id, {
        status: 'completed'
      });
      
      this.logger.log(`Activated church subscription ${foundChurchSubscription.id} and completed payment session ${pendingPaymentSession.id}`);
    } else if (foundChurchSubscription.status !== 'active') {
      // Reactivate if subscription was previously inactive (e.g., past_due)
      await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
        status: 'active',
      });
      this.logger.log(`Reactivated church subscription ${foundChurchSubscription.id}`);
    }

    this.logger.log(`Invoice paid for church ${foundChurchSubscription.churchId}: ${invoice.id}`);
  }

  /**
   * INVOICE.PAYMENT_FAILED - Payment failed (card declined, etc)
   */
  async handleInvoicePaymentFailed(
    event: Stripe.Event,
    metadata: { churchId?: string; planId?: string },
    churchSubscription: any,
    paymentSession: PaymentSession | null
  ): Promise<void> {
    const invoice = getEventData<StripeInvoice>(event);
    this.logger.log('Subscription updated: ' + invoice);
    
    this.logger.log(`Processing invoice.payment_failed: ${invoice.id}`);

    // Extract subscription ID from various locations in invoice
    const subscriptionId = (invoice.subscription as string) || 
                          (invoice as any).parent?.subscription_details?.subscription ||
                          (invoice as any).lines?.data?.[0]?.parent?.subscription_item_details?.subscription;

    if (!subscriptionId) {
      this.logger.warn(`Invoice ${invoice.id} has no subscription - skipping`);
      return;
    }

    this.logger.log(`Found subscription ID: ${subscriptionId}`);

    // Use churchSubscription passed from controller or fallback to query
    let foundChurchSubscription = churchSubscription;
    
    if (!foundChurchSubscription) {
      // Find church_subscription by stripeSubscriptionId
      foundChurchSubscription = await this.churchSubscriptionRepository.findByStripeSubscriptionId(subscriptionId);

      // Fallback: retrieve subscription from Stripe to get metadata
      if (!foundChurchSubscription) {
        try {
          const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
          if (subscription.metadata?.churchId) {
            this.logger.log(`Trying to find subscription by churchId from Stripe metadata: ${subscription.metadata.churchId}`);
            foundChurchSubscription = await this.churchSubscriptionRepository.findByChurchAndPlan(
              subscription.metadata.churchId,
              subscription.metadata.planId
            );
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve subscription from Stripe: ${subscriptionId}`, error);
        }
      }
    }

    // Update with Stripe subscription ID if missing
    if (foundChurchSubscription && !foundChurchSubscription.stripeSubscriptionId) {
      await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
        stripeSubscriptionId: subscriptionId
      });
      this.logger.log(`Updated church subscription ${foundChurchSubscription.id} with stripeSubscriptionId: ${subscriptionId}`);
    }

    if (!foundChurchSubscription) {
      this.logger.warn(`Church subscription not found for invoice: ${invoice.id}`);
      return;
    }

    // Mark subscription as past_due
    await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
      status: 'past_due',
    });

    this.logger.error(`Payment failed for church ${foundChurchSubscription.churchId}: ${invoice.id}`);

    // Send email notification to admin
    try {
      await this.emailService.sendPaymentFailedEmail(foundChurchSubscription.churchId);
      this.logger.log(`Payment failure notification email sent to church ${foundChurchSubscription.churchId}`);
    } catch (emailError) {
      this.logger.error(`Failed to send payment failure email to church ${foundChurchSubscription.churchId}`, emailError);
    }
  }

  /**
   * INVOICE.PAYMENT_ACTION_REQUIRED - Payment requires customer action (3D Secure/SCA)
   */
  async handleInvoicePaymentActionRequired(
    event: Stripe.Event,
    metadata: { churchId?: string; planId?: string },
    churchSubscription: any,
    paymentSession: PaymentSession | null
  ): Promise<void> {
    const invoice = getEventData<StripeInvoice>(event);
    
    this.logger.log(`Processing invoice.payment_action_required: ${invoice.id}`);

    // Extract subscription ID from various locations in invoice
    const subscriptionId = (invoice.subscription as string) || 
                          (invoice as any).parent?.subscription_details?.subscription ||
                          (invoice as any).lines?.data?.[0]?.parent?.subscription_item_details?.subscription;

    if (!subscriptionId) {
      this.logger.warn(`Invoice ${invoice.id} has no subscription - skipping`);
      return;
    }

    this.logger.log(`Found subscription ID: ${subscriptionId}`);

    // Use churchSubscription passed from controller or fallback to query
    let foundChurchSubscription = churchSubscription;
    
    if (!foundChurchSubscription) {
      // Find church_subscription by stripeSubscriptionId
      foundChurchSubscription = await this.churchSubscriptionRepository.findByStripeSubscriptionId(subscriptionId);

      // Fallback: retrieve subscription from Stripe to get metadata
      if (!foundChurchSubscription) {
        try {
          const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
          if (subscription.metadata?.churchId) {
            this.logger.log(`Trying to find subscription by churchId from Stripe metadata: ${subscription.metadata.churchId}`);
            foundChurchSubscription = await this.churchSubscriptionRepository.findByChurchAndPlan(
              subscription.metadata.churchId,
              subscription.metadata.planId
            );
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve subscription from Stripe: ${subscriptionId}`, error);
        }
      }
    }

    // Update with Stripe subscription ID if missing
    if (foundChurchSubscription && !foundChurchSubscription.stripeSubscriptionId) {
      await this.churchSubscriptionRepository.update(foundChurchSubscription.id, {
        stripeSubscriptionId: subscriptionId
      });
      this.logger.log(`Updated church subscription ${foundChurchSubscription.id} with stripeSubscriptionId: ${subscriptionId}`);
    }

    if (!foundChurchSubscription) {
      this.logger.warn(`Church subscription not found for invoice: ${invoice.id}`);
      return;
    }

    this.logger.log(`Payment action required for church ${foundChurchSubscription.churchId}: ${invoice.id}`);

    // Send email notification with payment URL
    try {
      await this.emailService.sendPaymentActionRequiredEmail(
        foundChurchSubscription.churchId,
        invoice.hosted_invoice_url || ''
      );
      this.logger.log(`Payment action required email sent to church ${foundChurchSubscription.churchId}`);
    } catch (emailError) {
      this.logger.error(`Failed to send payment action required email to church ${foundChurchSubscription.churchId}`, emailError);
    }
  }
}
