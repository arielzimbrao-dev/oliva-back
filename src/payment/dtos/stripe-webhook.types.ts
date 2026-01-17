/**
 * Stripe Webhook Types for Subscription Flow
 * Based on official Stripe API documentation
 */

import Stripe from 'stripe';

// Main DTOs for Subscription Flow
export type StripeCheckoutSession = Stripe.Checkout.Session;
export type StripeSubscription = Stripe.Subscription;
export type StripeInvoice = Stripe.Invoice;
export type StripeCustomer = Stripe.Customer;
export type StripeEvent = Stripe.Event;

// Checkout Session specific data
export interface CheckoutSessionCompletedData {
  id: string;
  object: 'checkout.session';
  mode: 'subscription';
  customer: string | null;
  subscription: string | null;
  client_reference_id: string | null;
  metadata: Record<string, string>;
  status: 'complete' | 'expired' | 'open';
  amount_total: number | null;
  currency: string | null;
}

// Subscription data
export interface SubscriptionData {
  id: string;
  object: 'subscription';
  customer: string;
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing';
  current_period_start: number;
  current_period_end: number;
  cancel_at: number | null;
  canceled_at: number | null;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
      };
    }>;
  };
  metadata: Record<string, string>;
}

// Invoice data
export interface InvoiceData {
  id: string;
  object: 'invoice';
  customer: string;
  subscription: string | null;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amount_due: number;
  amount_paid: number;
  currency: string;
  period_start: number;
  period_end: number;
  billing_reason: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

// Event types we handle
export enum StripeWebhookEventType {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',
  
  SUBSCRIPTION_CREATED = 'customer.subscription.created',
  SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  
  INVOICE_CREATED = 'invoice.created',
  INVOICE_PAID = 'invoice.paid',
  INVOICE_PAYMENT_FAILED = 'invoice.payment_failed',
  INVOICE_PAYMENT_ACTION_REQUIRED = 'invoice.payment_action_required',
}

// Helper to extract typed data from event
export function getEventData<T>(event: Stripe.Event): T {
  return event.data.object as T;
}
