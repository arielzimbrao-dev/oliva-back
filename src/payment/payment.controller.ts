import {
  Controller,
  Post,
  Req,
  HttpCode,
  Logger,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import type { RequestWithRawBody } from './request-with-raw-body.interface';
import { Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PlansService } from '../modules/plans/plans.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import Stripe from 'stripe';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt.auth.guard';
import { PaymentEventRepository } from '../entities/repository/payment-event.repository';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
    private readonly plansService: PlansService,
    private readonly paymentEventRepository: PaymentEventRepository,
  ) {
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2024-06-20',
    });
  }

  @Post('create-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Checkout session for monthly subscription' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        planId: {
          type: 'string',
          description: 'ID of the subscription plan',
          example: '550e8400-e29b-41d4-a716-446655440000'
        }
      },
      required: ['planId']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
    schema: {
      type: 'object',
      properties: {
        clientSecret: {
          type: 'string',
          description: 'Client secret for Stripe Checkout embedded mode',
          example: 'cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid plan ID or error creating session' })
  @ApiResponse({ status: 401, description: 'Unauthorized - valid JWT required' })
  async createStripeSession(@Body('planId') planId: string, @Res() res: Response, @Req() req): Promise<Response> {
    try {
      const session = await this.paymentService.createStripeSession(planId, req.user.churchId);
      return res.status(200).json({ clientSecret: session.client_secret });
    } catch (error) {
      this.logger.error('Erro ao criar sessão do Stripe', error);
      return res.status(400).json({ message: 'Erro ao criar sessão do Stripe', error: error.message });
    }
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'Stripe webhook endpoint',
    description: 'Handles Stripe webhook events for subscription lifecycle (checkout.session.completed, subscription.updated, invoice.paid, etc.). This endpoint is called by Stripe servers and requires webhook signature verification.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook event processed successfully (always returns 200 to prevent Stripe retries)' 
  })
  async handleStripeWebhook(@Req() req: RequestWithRawBody) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    
    if (!webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET not configured');
      return;
    }
    
    const payload = req.rawBody;
    const signature = req.headers['stripe-signature'] as string;
  
    
    if (!payload) {
      this.logger.error('No payload found in request');
      return;
    }
    
    if (!signature) {
      this.logger.error('No Stripe signature header found');
      return;
    }
    
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
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
    
    this.logger.log(`✓ Signature verified - Processing webhook event: ${event.type} (${event.id})`);

    // Save event for log and auditing (before processing)
    try {
      await this.paymentEventRepository.save({
        eventType: event.type,
        eventData: event as any,
        processed: false,
        sessionId: (event.data.object as any)?.id || null,
        subscriptionId: (event.data.object as any)?.subscription || null,
        customerId: (event.data.object as any)?.customer || null,
      });
      this.logger.log(`Saved webhook event ${event.id} for auditing`);
    } catch (auditError) {
      this.logger.error(`Failed to save webhook event for auditing: ${event.id}`, auditError);
      // Continue processing even if audit save fails
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.paymentService.handleCheckoutSessionCompleted(event);
          break;
        case 'checkout.session.expired':
          await this.paymentService.handleCheckoutSessionExpired(event);
          break;
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
