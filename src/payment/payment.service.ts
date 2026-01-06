import { Injectable, Logger, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { PlanRepository } from '../entities/repository/plan.entity';
import { ConfigService } from '@nestjs/config';
import { ChurchRepository } from 'src/entities/repository/church.repository';
import { PaymentSessionRepository } from '../entities/repository/payment-session.repository';
import { PaymentSession } from '../entities/payment-session.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly churchRepository: ChurchRepository,
    private readonly configService: ConfigService,
    private readonly paymentSessionRepository: PaymentSessionRepository,
  ) {}

  async createStripeSession(planId: string, churchId): Promise<Stripe.Checkout.Session> {
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
      amount = Math.round(Number(plan.amountDolar) * 100); // Stripe espera em centavos
    } else if (currency === 'EUR') {
      amount = Math.round(Number(plan.amountEuro) * 100);
    } else  {
      amount = Math.round(Number(plan.amountReal) * 100);
    }
    const stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: plan.name,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      ui_mode: 'embedded',
      return_url: 'http://localhost:8080/settings?session_id={CHECKOUT_SESSION_ID}',
    });
    // Salvar PaymentSession
    await this.paymentSessionRepository.create({
      planId,
      churchId,
      sessionId: session.id,
      status: 'pending',
    });
    return session;
  }

  async handleSubscriptionCreated(event: Stripe.Event) {
    this.logger.log(`Subscription created: ${event.id}`);
    // ...sua lógica
  }

  async handleSubscriptionUpdated(event: Stripe.Event) {
    this.logger.log(`Subscription updated: ${event.id}`);
    // ...sua lógica
  }

  async handleSubscriptionDeleted(event: Stripe.Event) {
    this.logger.log(`Subscription deleted: ${event.id}`);
    // ...sua lógica
  }

  async handleInvoicePaid(event: Stripe.Event) {
    this.logger.log(`Invoice paid: ${event.id}`);
    // ...sua lógica
  }

  async handleInvoicePaymentFailed(event: Stripe.Event) {
    this.logger.log(`Invoice payment failed: ${event.id}`);
    // ...sua lógica
  }

  async handleInvoiceCreated(event: Stripe.Event) {
    this.logger.log(`Invoice created: ${event.id}`);
    // ...sua lógica
  }
}
