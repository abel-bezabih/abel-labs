/**
 * Stripe Payment Provider
 * 
 * Handles all Stripe payments for CAD and USD currencies.
 * Uses Stripe Checkout Sessions for secure payment processing.
 */

import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  IPaymentProvider,
  CheckoutSessionParams,
  SubscriptionCheckoutParams,
  CheckoutSession,
  WebhookEvent,
  PaymentResult,
  ProviderPaymentStatus,
  RefundResult,
} from '../interfaces/payment-provider.interface';
import { PaymentProvider, Currency, PaymentStatus } from '@abel-labs/types';

@Injectable()
export class StripeProvider implements IPaymentProvider {
  private readonly logger = new Logger(StripeProvider.name);
  readonly provider = PaymentProvider.STRIPE;
  readonly supportedCurrencies: Currency[] = [Currency.CAD, Currency.USD];

  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      this.logger.warn('⚠️ STRIPE_SECRET_KEY not set - Stripe provider will not work');
      return;
    }

    // Validate key format
    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      this.logger.error(`❌ Invalid STRIPE_SECRET_KEY format. Key must start with 'sk_test_' or 'sk_live_'. Got: ${secretKey.substring(0, 10)}...`);
      this.logger.error('⚠️ Stripe provider will not work - fix STRIPE_SECRET_KEY in .env');
      return;
    }

    try {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
      this.logger.log('✅ Stripe provider initialized');
    } catch (error: any) {
      this.logger.error(`❌ Failed to initialize Stripe: ${error.message}`);
      this.logger.error('⚠️ Stripe provider will not work - check STRIPE_SECRET_KEY in .env');
    }
  }

  supportsCurrency(currency: Currency): boolean {
    return this.supportedCurrencies.includes(currency);
  }

  /**
   * Create a one-time payment checkout session
   */
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
      }
      if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
        throw new Error(`Invalid STRIPE_SECRET_KEY format. Key must start with 'sk_test_' or 'sk_live_'. Check your .env file.`);
      }
      throw new Error('Stripe not initialized - check STRIPE_SECRET_KEY in .env file');
    }

    if (!this.supportsCurrency(params.currency)) {
      throw new Error(`Stripe does not support currency: ${params.currency}`);
    }

    // Map Currency enum to Stripe currency code (lowercase)
    const currencyMap: Record<Currency, string> = {
      [Currency.USD]: 'usd',
      [Currency.CAD]: 'cad',
      [Currency.ETB]: 'etb', // Not used, but for completeness
    };

    const stripeCurrency = currencyMap[params.currency];

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: stripeCurrency,
              product_data: {
                name: params.description,
                description: params.description,
              },
              unit_amount: Math.round(params.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: {
          invoiceId: params.invoiceId,
          ...params.metadata,
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      });

      this.logger.log(`✅ Stripe checkout session created: ${session.id}`);

      return {
        sessionId: session.id,
        paymentUrl: session.url!,
        provider: this.provider,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to create Stripe checkout session: ${error.message}`);
      
      // Provide more specific error messages
      if (error.message?.includes('Invalid API Key')) {
        const key = process.env.STRIPE_SECRET_KEY;
        const keyPreview = key ? `${key.substring(0, 10)}...` : 'not set';
        throw new Error(
          `Invalid Stripe API Key. Check STRIPE_SECRET_KEY in .env file. ` +
          `Key should start with 'sk_test_' or 'sk_live_'. Current key: ${keyPreview}`
        );
      }
      
      if (error.type === 'StripeInvalidRequestError') {
        throw new Error(`Stripe API error: ${error.message}`);
      }
      
      throw new Error(`Stripe checkout creation failed: ${error.message}`);
    }
  }

  /**
   * Create a recurring subscription checkout session
   */
  async createSubscriptionCheckout(params: SubscriptionCheckoutParams): Promise<CheckoutSession> {
    if (!this.stripe) {
      throw new Error('Stripe not initialized - check STRIPE_SECRET_KEY');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: params.cancelUrl,
        customer_email: params.customerEmail,
        metadata: params.metadata,
      });

      this.logger.log(`✅ Stripe subscription checkout session created: ${session.id}`);

      return {
        sessionId: session.id,
        paymentUrl: session.url!,
        provider: this.provider,
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to create Stripe subscription checkout: ${error.message}`);
      throw new Error(`Stripe subscription checkout creation failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(payload: Buffer, signature: string): Promise<WebhookEvent> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not set');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return {
        type: event.type,
        id: event.id,
        data: event.data,
        timestamp: new Date(event.created * 1000),
      };
    } catch (error: any) {
      this.logger.error(`❌ Stripe webhook signature verification failed: ${error.message}`);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: WebhookEvent): Promise<PaymentResult> {
    try {
      // Handle checkout.session.completed (one-time payments)
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'payment') {
          // One-time payment
          const invoiceId = session.metadata?.invoiceId;
          if (!invoiceId) {
            throw new Error('Invoice ID not found in session metadata');
          }

          return {
            success: true,
            transactionId: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: (session.currency?.toUpperCase() || 'USD') as Currency,
            status: PaymentStatus.COMPLETED,
            metadata: {
              customerEmail: session.customer_email,
              paymentStatus: session.payment_status,
            },
          };
        } else if (session.mode === 'subscription') {
          // Subscription created
          const subscriptionId = session.subscription as string;
          return {
            success: true,
            transactionId: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: (session.currency?.toUpperCase() || 'USD') as Currency,
            status: PaymentStatus.COMPLETED,
            metadata: {
              subscriptionId,
              customerEmail: session.customer_email,
            },
          };
        }
      }

      // Handle invoice.payment_succeeded (subscription payments)
      if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        return {
          success: true,
          transactionId: invoice.payment_intent as string,
          amount: invoice.amount_paid / 100,
          currency: (invoice.currency.toUpperCase() || 'USD') as Currency,
          status: PaymentStatus.COMPLETED,
          metadata: {
            subscriptionId,
            invoiceId: invoice.id,
            periodStart: invoice.period_start,
            periodEnd: invoice.period_end,
          },
        };
      }

      // Handle payment_intent.succeeded (fallback)
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata?.invoiceId;

        return {
          success: true,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: (paymentIntent.currency.toUpperCase() || 'USD') as Currency,
          status: PaymentStatus.COMPLETED,
          metadata: {
            invoiceId,
            paymentMethod: paymentIntent.payment_method,
          },
        };
      }

      // Handle failed payments
      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        return {
          success: false,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: (paymentIntent.currency.toUpperCase() || 'USD') as Currency,
          status: PaymentStatus.FAILED,
          error: paymentIntent.last_payment_error?.message || 'Payment failed',
        };
      }

      // Unhandled event type
      this.logger.warn(`⚠️ Unhandled Stripe webhook event type: ${event.type}`);
      return {
        success: false,
        transactionId: event.id,
        amount: 0,
        currency: Currency.USD,
        status: PaymentStatus.PENDING,
        error: `Unhandled event type: ${event.type}`,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error processing Stripe webhook: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment status from Stripe
   */
  async getPaymentStatus(transactionId: string): Promise<ProviderPaymentStatus> {
    try {
      // Try to get as checkout session first
      try {
        const session = await this.stripe.checkout.sessions.retrieve(transactionId);
        return {
          status: session.payment_status === 'paid' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: (session.currency?.toUpperCase() || 'USD') as Currency,
          paidAt: session.payment_status === 'paid' ? new Date() : undefined,
        };
      } catch {
        // Not a checkout session, try payment intent
        const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);
        return {
          status: paymentIntent.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
          amount: paymentIntent.amount / 100,
          currency: (paymentIntent.currency.toUpperCase() || 'USD') as Currency,
          paidAt: paymentIntent.status === 'succeeded' ? new Date() : undefined,
        };
      }
    } catch (error: any) {
      this.logger.error(`❌ Failed to get Stripe payment status: ${error.message}`);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId: string, amount?: number): Promise<RefundResult> {
    try {
      // Get the payment intent from the checkout session
      const session = await this.stripe.checkout.sessions.retrieve(transactionId);
      const paymentIntentId = session.payment_intent as string;

      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to refund Stripe payment: ${error.message}`);
      return {
        success: false,
        refundId: '',
        amount: 0,
        error: error.message,
      };
    }
  }
}



