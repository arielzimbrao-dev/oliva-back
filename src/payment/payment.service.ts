import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

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
