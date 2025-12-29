import {
  Controller,
  Post,
  Req,
  HttpCode,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import type { RequestWithRawBody } from './request-with-raw-body.interface';
import Stripe from 'stripe';
// Ajuste o path conforme sua estrutura real

const processedEvents = new Set<string>();

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });
  }

  @Post()
  @HttpCode(200)
  async handleStripeWebhook(@Req() req: RequestWithRawBody) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        (req.headers['stripe-signature'] as string) || '',
        webhookSecret,
      );
    } catch (err) {
      if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
        this.logger.error('Stripe signature verification failed', err);
      } else {
        this.logger.error('Stripe webhook error', err);
      }
      return; // Always 200 OK
    }

    // Idempotência básica
    if (processedEvents.has(event.id)) {
      this.logger.warn(`Event ${event.id} already processed`);
      return;
    }
    processedEvents.add(event.id);

    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.paymentService.handleSubscriptionCreated(event);
          break;
        case 'customer.subscription.updated':
          await this.paymentService.handleSubscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          await this.paymentService.handleSubscriptionDeleted(event);
          break;
        case 'invoice.paid':
          await this.paymentService.handleInvoicePaid(event);
          break;
        case 'invoice.payment_failed':
          await this.paymentService.handleInvoicePaymentFailed(event);
          break;
        case 'invoice.created':
          await this.paymentService.handleInvoiceCreated(event);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Error handling event ${event.id}:`, err);
    }
    // Always return 200 OK
  }
}
