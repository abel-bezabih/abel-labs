/**
 * Unified Payment Provider Interface
 * 
 * All payment providers (Stripe, Chapa, Telebirr) implement this interface.
 * This allows the PaymentService to work with any provider without knowing
 * the implementation details.
 */

import { Currency, PaymentProvider, PaymentStatus } from '@abel-labs/types';

/**
 * Parameters for creating a one-time checkout session
 */
export interface CheckoutSessionParams {
  invoiceId: string;
  amount: number;
  currency: Currency;
  customerEmail?: string;
  customerName?: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

/**
 * Parameters for creating a subscription checkout session
 */
export interface SubscriptionCheckoutParams {
  customerEmail: string;
  customerName?: string;
  priceId: string; // Stripe Price ID for subscription
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

/**
 * Result of creating a checkout session
 */
export interface CheckoutSession {
  sessionId: string;
  paymentUrl: string;
  provider: PaymentProvider;
  expiresAt?: Date;
}

/**
 * Webhook event from payment provider
 */
export interface WebhookEvent {
  type: string;
  id: string;
  data: any;
  timestamp: Date;
}

/**
 * Result of processing a payment
 */
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Payment status from provider
 */
export interface ProviderPaymentStatus {
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  paidAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Refund result
 */
export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  error?: string;
}

/**
 * Main payment provider interface
 * 
 * All payment providers must implement this interface.
 */
export interface IPaymentProvider {
  /**
   * Get the provider name
   */
  readonly provider: PaymentProvider;

  /**
   * Get supported currencies for this provider
   */
  readonly supportedCurrencies: Currency[];

  /**
   * Check if provider supports a currency
   */
  supportsCurrency(currency: Currency): boolean;

  /**
   * Create a one-time payment checkout session
   */
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession>;

  /**
   * Create a recurring subscription checkout session
   * Note: Only Stripe supports subscriptions currently
   */
  createSubscriptionCheckout?(params: SubscriptionCheckoutParams): Promise<CheckoutSession>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: Buffer, signature: string): Promise<WebhookEvent>;

  /**
   * Process webhook event
   */
  processWebhookEvent(event: WebhookEvent): Promise<PaymentResult>;

  /**
   * Get payment status from provider
   */
  getPaymentStatus(transactionId: string): Promise<ProviderPaymentStatus>;

  /**
   * Refund a payment (if supported)
   */
  refundPayment?(transactionId: string, amount?: number): Promise<RefundResult>;
}











