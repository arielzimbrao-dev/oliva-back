import { Injectable, Logger, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { PlanRepository } from '../entities/repository/plan.entity';
import { ConfigService } from '@nestjs/config';
import { ChurchRepository } from 'src/entities/repository/church.repository';
import { PaymentSessionRepository } from '../entities/repository/payment-session.repository';
import { ChurchSubscriptionRepository } from '../entities/repository/church-subscription.repository';
import { PaymentEventRepository } from '../entities/repository/payment-event.repository';
import { EmailService } from '../modules/email/email.service';
import { PaymentSession } from '../entities/payment-session.entity';
import { DataSource } from 'typeorm';
import { StripeCheckoutSession, StripeSubscription, StripeInvoice, getEventData } from './dtos/stripe-webhook.types';

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
    private readonly paymentEventRepository: PaymentEventRepository,
    private readonly emailService: EmailService,
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });
  }

  async createStripeSession(planId: string, churchId: string): Promise<Stripe.Checkout.Session> {
    // Buscar plano pelo planId
    const plan = await this.planRepository.findOneById(planId);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    const church = await this.churchRepository.findOneById(churchId);
    if (!church) {
      throw new Error('Igreja não encontrada');
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
    const existingSubscription = await this.churchSubscriptionRepository.findOne({
      where: { churchId },
      order: { createdAt: 'DESC' }
    } as any);

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
  async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    const session = getEventData<StripeCheckoutSession>(event);
    
    this.logger.log(`Processing checkout.session.completed: ${session.id}`);

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Check if event already processed (idempotency via database)
      const existingEvent = await this.paymentEventRepository.findOne({
        where: { 
          eventType: event.type,
          sessionId: session.id
        }
      } as any);

      if (existingEvent) {
        this.logger.warn(`Event ${event.id} already processed (duplicate webhook)`);
        await queryRunner.rollbackTransaction();
        return;
      }

      // 2. Find payment_session by sessionId + status='pending'
      const paymentSession = await this.paymentSessionRepository.findOne({
        where: { sessionId: session.id, status: 'pending' }
      } as any);

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
        throw new Error(`Plan not found: ${paymentSession.planId}`);
      }

      // 5. Create church_subscription
      const churchSubscription = await this.churchSubscriptionRepository.create({
        churchId: paymentSession.churchId,
        planId: paymentSession.planId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        status: 'active',
        type: 'recurring',
        amount: plan.amountDolar, // Adjust based on currency
        currency: session.currency?.toUpperCase() || 'USD',
        startsAt: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      } as any);

      this.logger.log(`Created church subscription: ${churchSubscription.id}`);

      // 6. Update payment_session status
      await this.paymentSessionRepository.update(paymentSession.id, { 
        status: 'completed' 
      });

      // 7. Log event
      await this.paymentEventRepository.save({
        churchId: paymentSession.churchId,
        customerId: session.customer as string,
        sessionId: session.id,
        subscriptionId: subscription.id,
        eventType: event.type,
        eventData: event as any,
        processed: true,
        processedAt: new Date(),
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
  async handleCheckoutSessionExpired(event: Stripe.Event): Promise<void> {
    const session = getEventData<StripeCheckoutSession>(event);
    
    this.logger.log(`Processing checkout.session.expired: ${session.id}`);

    const paymentSession = await this.paymentSessionRepository.findOne({
      where: { sessionId: session.id, status: 'pending' }
    } as any);

    if (paymentSession) {
      await this.paymentSessionRepository.update(paymentSession.id, { 
        status: 'expired' 
      });

      await this.paymentEventRepository.save({
        churchId: paymentSession.churchId,
        sessionId: session.id,
        eventType: event.type,
        eventData: event,
        processed: true,
        processedAt: new Date(),
      });

      this.logger.log(`Expired payment session: ${session.id}`);
    }
  }

  /**
   * CUSTOMER.SUBSCRIPTION.CREATED - Redundant (use checkout.session.completed)
   */
  async handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
    const subscription = getEventData<StripeSubscription>(event);
    this.logger.log(`Subscription created: ${subscription.id} (handled by checkout.session.completed)`);
    
    // Save event for auditing
    await this.paymentEventRepository.save({
      churchId: '', // Will be filled if we can find it
      customerId: subscription.customer as string,
      subscriptionId: subscription.id,
      eventType: event.type,
      eventData: event,
      processed: true,
      processedAt: new Date(),
    });
  }

  /**
   * CUSTOMER.SUBSCRIPTION.UPDATED - Update period_end, status
   */
  async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = getEventData<StripeSubscription>(event);
    this.logger.log('Subscription updated: ' + subscription);
    
    this.logger.log(`Processing subscription.updated: ${subscription.id}`);

    // Find church_subscription by stripeSubscriptionId
    const churchSubscription = await this.churchSubscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscription.id }
    } as any);

    if (!churchSubscription) {
      this.logger.warn(`Church subscription not found for Stripe subscription: ${subscription.id}`);
      return;
    }

    // Update subscription details
    await this.churchSubscriptionRepository.update(churchSubscription.id, {
      status: subscription.status === 'active' ? 'active' : 
              subscription.status === 'past_due' ? 'past_due' :
              subscription.status === 'canceled' ? 'canceled' : 'expired',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : undefined,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
    });

    await this.paymentEventRepository.save({
      churchId: churchSubscription.churchId,
      customerId: subscription.customer as string,
      subscriptionId: subscription.id,
      eventType: event.type,
      eventData: event,
      processed: true,
      processedAt: new Date(),
    });

    this.logger.log(`Updated church subscription ${churchSubscription.id} to status: ${subscription.status}`);
  }

  /**
   * CUSTOMER.SUBSCRIPTION.DELETED - Cancel subscription
   */
  async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = getEventData<StripeSubscription>(event);
    this.logger.log('Subscription updated: ' + subscription);
    
    this.logger.log(`Processing subscription.deleted: ${subscription.id}`);

    const churchSubscription = await this.churchSubscriptionRepository.findOne({
      where: { stripeSubscriptionId: subscription.id }
    } as any);

    if (!churchSubscription) {
      this.logger.warn(`Church subscription not found for Stripe subscription: ${subscription.id}`);
      return;
    }

    await this.churchSubscriptionRepository.update(churchSubscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    await this.paymentEventRepository.save({
      churchId: churchSubscription.churchId,
      customerId: subscription.customer as string,
      subscriptionId: subscription.id,
      eventType: event.type,
      eventData: event,
      processed: true,
      processedAt: new Date(),
    });

    this.logger.log(`Canceled church subscription: ${churchSubscription.id}`);
  }

  /**
   * INVOICE.PAID - Monthly charge successful
   */
  async handleInvoicePaid(event: Stripe.Event): Promise<void> {
    const invoice = getEventData<StripeInvoice>(event);
    this.logger.log('Subscription updated: ' + invoice);
    
    this.logger.log(`Processing invoice.paid: ${invoice.id}`);

    if (!invoice.subscription) {
      this.logger.warn(`Invoice ${invoice.id} has no subscription - skipping`);
      return;
    }

    const churchSubscription = await this.churchSubscriptionRepository.findOne({
      where: { stripeSubscriptionId: invoice.subscription as string }
    } as any);

    if (!churchSubscription) {
      this.logger.warn(`Church subscription not found for invoice: ${invoice.id}`);
      return;
    }

    // Ensure subscription is active after payment
    if (churchSubscription.status !== 'active') {
      await this.churchSubscriptionRepository.update(churchSubscription.id, {
        status: 'active',
      });
      this.logger.log(`Reactivated church subscription ${churchSubscription.id}`);
    }

    await this.paymentEventRepository.save({
      churchId: churchSubscription.churchId,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string,
      eventType: event.type,
      eventData: event,
      processed: true,
      processedAt: new Date(),
    });

    this.logger.log(`Invoice paid for church ${churchSubscription.churchId}: ${invoice.id}`);
  }

  /**
   * INVOICE.PAYMENT_FAILED - Payment failed (card declined, etc)
   */
  async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = getEventData<StripeInvoice>(event);
    this.logger.log('Subscription updated: ' + invoice);
    
    this.logger.log(`Processing invoice.payment_failed: ${invoice.id}`);

    if (!invoice.subscription) {
      this.logger.warn(`Invoice ${invoice.id} has no subscription - skipping`);
      return;
    }

    const churchSubscription = await this.churchSubscriptionRepository.findOne({
      where: { stripeSubscriptionId: invoice.subscription as string }
    } as any);

    if (!churchSubscription) {
      this.logger.warn(`Church subscription not found for invoice: ${invoice.id}`);
      return;
    }

    // Mark subscription as past_due
    await this.churchSubscriptionRepository.update(churchSubscription.id, {
      status: 'past_due',
    });

    await this.paymentEventRepository.save({
      churchId: churchSubscription.churchId,
      customerId: invoice.customer as string,
      subscriptionId: invoice.subscription as string,
      eventType: event.type,
      eventData: event as any,
      processed: true,
      processedAt: new Date(),
    });

    this.logger.error(`Payment failed for church ${churchSubscription.churchId}: ${invoice.id}`);

    // Send email notification to admin
    try {
      await this.emailService.sendPaymentFailedEmail(churchSubscription.churchId);
      this.logger.log(`Payment failure notification email sent to church ${churchSubscription.churchId}`);
    } catch (emailError) {
      this.logger.error(`Failed to send payment failure email to church ${churchSubscription.churchId}`, emailError);
    }
  }

  /**
   * INVOICE.CREATED - New invoice generated (optional logging)
   */
  async handleInvoiceCreated(event: Stripe.Event): Promise<void> {
    const invoice = getEventData<StripeInvoice>(event);
    this.logger.log(`Invoice created: ${invoice.id}`);
    
    // Optional: Save event for auditing
    if (invoice.subscription) {
      const churchSubscription = await this.churchSubscriptionRepository.findOne({
        where: { stripeSubscriptionId: invoice.subscription as string }
      } as any);

      if (churchSubscription) {
        await this.paymentEventRepository.save({
          churchId: churchSubscription.churchId,
          customerId: invoice.customer as string,
          subscriptionId: invoice.subscription as string,
          eventType: event.type,
          eventData: event,
          processed: true,
          processedAt: new Date(),
        });
      }
    }
  }
}
