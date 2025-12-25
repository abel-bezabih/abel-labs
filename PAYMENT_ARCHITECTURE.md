# 💳 Payment System Architecture

## Overview

This document describes the production-ready payment system for Abel Labs / Eastpath Trading. The system supports multiple payment providers with a unified interface, routing payments based on currency.

## Core Principles

1. **Currency-Based Routing**: Payments are automatically routed to the correct provider based on currency
   - CAD/USD → Stripe
   - ETB → Telebirr/Chapa

2. **Unified Interface**: All payment providers implement the same interface, making it easy to add new providers

3. **Server-Side Only**: All payment logic runs server-side. Frontend never handles payment secrets or makes direct payment API calls.

4. **Webhook Verification**: All webhooks are verified server-side before processing

5. **Single Source of Truth**: All payments are stored in a single `Payment` table with provider metadata

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  - Displays payment links                                    │
│  - Redirects to provider checkout                            │
│  - Shows payment status                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP API Calls
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   API Server (NestJS)                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          PaymentService (Orchestrator)              │    │
│  │  - Routes by currency                               │    │
│  │  - Manages payment lifecycle                        │    │
│  │  - Updates invoice status                           │    │
│  └──────────────┬──────────────────┬──────────────────┘    │
│                 │                  │                        │
│    ┌────────────▼──────┐  ┌────────▼──────────┐            │
│    │  StripeProvider   │  │  ETBProvider      │            │
│    │  (CAD/USD only)   │  │  (ETB only)       │            │
│    │                   │  │                   │            │
│    │  - Checkout       │  │  - Chapa          │            │
│    │  - Subscriptions  │  │  - Telebirr       │            │
│    │  - Webhooks       │  │  - Webhooks       │            │
│    └──────────────────┘  └───────────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Webhook Handlers                        │    │
│  │  - Verify signatures                                 │    │
│  │  - Process events                                    │    │
│  │  - Update database                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Webhooks
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
│   Stripe     │ │   Chapa     │ │ Telebirr  │
│   (CAD/USD)  │ │   (ETB)     │ │  (ETB)    │
└──────────────┘ └─────────────┘ └───────────┘
```

## Payment Flow

### One-Time Payment (Invoice)

1. **Invoice Created** → Admin creates invoice for project/service
2. **Payment Link Requested** → Client requests payment link via API
3. **Provider Selected** → System routes to Stripe (CAD/USD) or ETB provider (ETB)
4. **Checkout Session Created** → Provider creates checkout session
5. **Client Redirected** → Client redirected to provider checkout page
6. **Payment Processed** → Client completes payment on provider's page
7. **Webhook Received** → Provider sends webhook to our server
8. **Payment Verified** → Server verifies webhook signature
9. **Payment Recorded** → Payment saved to database
10. **Invoice Updated** → Invoice status updated to PAID if fully paid
11. **Notifications Sent** → Admin and client notified

### Recurring Subscription

1. **Subscription Created** → Admin creates subscription plan
2. **Checkout Session Created** → Stripe subscription checkout session created
3. **Client Subscribes** → Client completes subscription on Stripe
4. **Webhook Received** → `customer.subscription.created` event
5. **Subscription Recorded** → Subscription saved to database
6. **Recurring Payments** → Stripe automatically charges each billing period
7. **Webhooks for Each Payment** → `invoice.payment_succeeded` events
8. **Payment Recorded** → Each payment recorded in database

## Database Schema

### Payment Table
- `id`: Unique payment ID
- `invoiceId`: Related invoice (nullable for subscriptions)
- `subscriptionId`: Related subscription (nullable for one-time)
- `amount`: Payment amount
- `currency`: Currency (CAD, USD, ETB)
- `provider`: Payment provider (STRIPE, CHAPA, TELEBIRR)
- `status`: Payment status (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
- `transactionId`: Provider transaction ID
- `metadata`: Provider-specific metadata (JSON)
- `createdAt`, `updatedAt`: Timestamps

### Subscription Table (Future)
- `id`: Unique subscription ID
- `customerId`: Customer/user ID
- `stripeSubscriptionId`: Stripe subscription ID
- `status`: Subscription status
- `currentPeriodStart`, `currentPeriodEnd`: Billing period
- `metadata`: Additional data

## Provider Interface

All payment providers implement:

```typescript
interface IPaymentProvider {
  // Create one-time payment checkout
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession>;
  
  // Create recurring subscription checkout
  createSubscriptionCheckout(params: SubscriptionCheckoutParams): Promise<CheckoutSession>;
  
  // Verify webhook signature
  verifyWebhookSignature(payload: Buffer, signature: string): Promise<WebhookEvent>;
  
  // Process webhook event
  processWebhookEvent(event: WebhookEvent): Promise<PaymentResult>;
  
  // Get payment status
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
  
  // Refund payment (if supported)
  refundPayment(transactionId: string, amount?: number): Promise<RefundResult>;
}
```

## Currency Routing Logic

```typescript
function routePayment(currency: Currency): PaymentProvider {
  switch (currency) {
    case Currency.CAD:
    case Currency.USD:
      return PaymentProvider.STRIPE;
    case Currency.ETB:
      // Can be configured to use Chapa or Telebirr
      return PaymentProvider.CHAPA; // or TELEBIRR
    default:
      throw new Error(`Unsupported currency: ${currency}`);
  }
}
```

## Security

1. **Environment Variables**: All secrets stored in `.env`, never committed
2. **Webhook Verification**: All webhooks verified using provider signatures
3. **Server-Side Only**: Payment processing never happens on frontend
4. **HTTPS Required**: All webhook endpoints require HTTPS in production
5. **Idempotency**: Payment processing is idempotent (safe to retry)

## Error Handling

- **Provider Errors**: Caught and logged, user-friendly error returned
- **Webhook Failures**: Logged and retried (with exponential backoff)
- **Network Issues**: Retry logic for transient failures
- **Invalid Payments**: Rejected and logged for review

## Testing

- **Unit Tests**: Test each provider in isolation
- **Integration Tests**: Test full payment flow
- **Webhook Tests**: Test webhook verification and processing
- **Test Cards**: Use provider test cards (Stripe: 4242 4242 4242 4242)

## Future Enhancements

1. **Subscription Management**: Full subscription lifecycle
2. **Payment Methods**: Save payment methods for future use
3. **Refunds**: Automated refund processing
4. **Multi-Currency**: Support more currencies
5. **Payment Plans**: Installment payments
6. **Analytics**: Payment analytics and reporting











