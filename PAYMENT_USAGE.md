# 💳 Payment System Usage Guide

## Overview

This guide explains how to use the payment system for all your services (web dev, software, ecommerce, subscriptions, invoices).

## Architecture Summary

- **Currency-Based Routing**: CAD/USD → Stripe, ETB → Chapa/Telebirr
- **Unified Interface**: All providers work the same way
- **Server-Side Only**: All payment logic on backend
- **Webhook Verification**: All webhooks verified before processing

## API Endpoints

### 1. Create Payment Checkout (Invoice)

**Endpoint:** `POST /payments/checkout`

**Authentication:** Required (JWT)

**Request:**
```json
{
  "invoiceId": "invoice_123",
  "successUrl": "https://yoursite.com/payment/success",
  "cancelUrl": "https://yoursite.com/payment/cancel",
  "provider": "STRIPE" // Optional - auto-selected by currency
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "provider": "STRIPE",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

**Usage Flow:**
1. Admin creates invoice for project/service
2. Client requests payment link via this endpoint
3. System automatically routes to Stripe (CAD/USD) or Chapa (ETB)
4. Client redirected to `paymentUrl`
5. Client completes payment on provider's page
6. Webhook confirms payment → Invoice marked as PAID

### 2. Create Subscription Checkout

**Endpoint:** `POST /payments/subscriptions/checkout`

**Authentication:** Required (JWT)

**Request:**
```json
{
  "priceId": "price_1234567890", // Stripe Price ID
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "successUrl": "https://yoursite.com/subscription/success",
  "cancelUrl": "https://yoursite.com/subscription/cancel",
  "metadata": {
    "planId": "premium_monthly"
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "paymentUrl": "https://checkout.stripe.com/subscription/cs_test_...",
  "provider": "STRIPE"
}
```

**Usage Flow:**
1. Create Stripe Price in Stripe Dashboard
2. Call this endpoint with the Price ID
3. Client redirected to subscription checkout
4. Client subscribes → Webhook confirms → Subscription active
5. Stripe automatically charges each billing period
6. Each payment triggers webhook → Payment recorded

### 3. Webhook Endpoints

**Stripe:** `POST /payments/webhooks/stripe`
**Chapa:** `POST /payments/webhooks/chapa`
**Telebirr:** `POST /payments/webhooks/telebirr`

These are called by the payment providers. You configure them in:
- **Stripe Dashboard** → Developers → Webhooks
- **Chapa Dashboard** → Webhooks
- **Telebirr Dashboard** → Webhooks

### 4. Get Payment Status

**Endpoint:** `GET /payments/status?transactionId=cs_test_...&provider=STRIPE`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "status": "COMPLETED",
  "amount": 100.00,
  "currency": "USD",
  "paidAt": "2024-01-01T12:00:00Z"
}
```

### 5. Refund Payment

**Endpoint:** `POST /payments/refund`

**Authentication:** Required (JWT)

**Request:**
```json
{
  "transactionId": "cs_test_...",
  "amount": 50.00 // Optional - full refund if omitted
}
```

## Use Cases

### Use Case 1: Invoice Payment (One-Time)

**Scenario:** Client needs to pay for a completed website project.

1. **Create Invoice:**
   ```typescript
   const invoice = await prisma.invoice.create({
     data: {
       projectId: project.id,
       invoiceNumber: 'INV-2024-001',
       amount: 5000.00,
       currency: 'CAD', // or 'USD'
       status: 'SENT',
       dueDate: new Date('2024-02-01'),
       items: [
         {
           description: 'Website Development',
           quantity: 1,
           unitPrice: 5000.00,
           total: 5000.00,
         },
       ],
     },
   });
   ```

2. **Create Payment Link:**
   ```typescript
   const checkout = await paymentsService.createCheckoutSession(
     invoice.id,
     'https://yoursite.com/payment/success',
     'https://yoursite.com/payment/cancel',
   );
   ```

3. **Send to Client:**
   - Email the `checkout.paymentUrl` to client
   - Or display in client portal

4. **Client Pays:**
   - Client clicks link → Redirected to Stripe Checkout
   - Client enters card details → Payment processed
   - Client redirected to success URL

5. **Webhook Confirms:**
   - Stripe sends webhook → Payment recorded
   - Invoice status → PAID
   - Admin notified

### Use Case 2: Subscription Service

**Scenario:** Client subscribes to monthly maintenance plan.

1. **Create Stripe Price:**
   - Go to Stripe Dashboard → Products → Create Product
   - Create recurring price (e.g., $99/month)
   - Copy the Price ID (e.g., `price_1234567890`)

2. **Create Subscription Checkout:**
   ```typescript
   const checkout = await paymentsService.createSubscriptionCheckout(
     'price_1234567890', // From Stripe Dashboard
     'client@example.com',
     'Client Name',
     'https://yoursite.com/subscription/success',
     'https://yoursite.com/subscription/cancel',
   );
   ```

3. **Client Subscribes:**
   - Client redirected to Stripe → Subscribes
   - Webhook confirms → Subscription active

4. **Recurring Payments:**
   - Stripe charges automatically each month
   - Each charge triggers webhook → Payment recorded
   - No action needed from you!

### Use Case 3: ETB Payment (Ethiopian Birr)

**Scenario:** Client in Ethiopia needs to pay in ETB.

1. **Create Invoice (ETB):**
   ```typescript
   const invoice = await prisma.invoice.create({
     data: {
       projectId: project.id,
       invoiceNumber: 'INV-2024-002',
       amount: 50000.00, // ETB
       currency: 'ETB',
       status: 'SENT',
       dueDate: new Date('2024-02-01'),
       items: [...],
     },
   });
   ```

2. **Create Payment Link:**
   ```typescript
   const checkout = await paymentsService.createCheckoutSession(
     invoice.id,
     'https://yoursite.com/payment/success',
     'https://yoursite.com/payment/cancel',
   );
   // Automatically routes to Chapa (ETB provider)
   ```

3. **Client Pays:**
   - Client redirected to Chapa checkout
   - Client pays via mobile money/bank
   - Webhook confirms → Payment recorded

## Frontend Integration

### React/Next.js Example

```typescript
// pages/payment/[invoiceId].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function PaymentPage() {
  const router = useRouter();
  const { invoiceId } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });

      const data = await response.json();
      
      if (data.paymentUrl) {
        // Redirect to payment provider
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Pay Invoice</h1>
      {error && <p className="error">{error}</p>}
      <button onClick={createPayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
```

## Environment Variables

```bash
# Stripe (CAD/USD)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Chapa (ETB)
CHAPA_SECRET_KEY=your_chapa_key
CHAPA_WEBHOOK_SECRET=your_chapa_webhook_secret

# Telebirr (ETB)
TELEBIRR_SECRET_KEY=your_telebirr_key
TELEBIRR_WEBHOOK_SECRET=your_telebirr_webhook_secret

# ETB Provider Selection (optional, defaults to CHAPA)
ETB_PAYMENT_PROVIDER=CHAPA # or TELEBIRR

# URLs
API_URL=https://api.yoursite.com
FRONTEND_URL=https://yoursite.com
```

## Testing

### Stripe Test Cards

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`
- **Any future expiry, any CVC, any ZIP**

### Test Webhooks (Local)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/payments/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

## Security Best Practices

1. ✅ **Never expose secrets** - All secrets in `.env`, never in frontend
2. ✅ **Verify webhooks** - All webhooks verified server-side
3. ✅ **HTTPS required** - Use HTTPS in production
4. ✅ **Idempotency** - Payment processing is safe to retry
5. ✅ **Server-side only** - Frontend never processes payments directly

## Common Patterns

### Pattern 1: Service-Based Payment

```typescript
// For services like "Website Development"
const invoice = await createInvoice({
  projectId: project.id,
  amount: project.budget,
  currency: project.currency, // Auto-routed by currency
});

const checkout = await paymentsService.createCheckoutSession(invoice.id);
// Send checkout.paymentUrl to client
```

### Pattern 2: Subscription-Based Service

```typescript
// For recurring services like "Monthly Maintenance"
const checkout = await paymentsService.createSubscriptionCheckout(
  'price_monthly_maintenance', // Stripe Price ID
  client.email,
  client.name,
);
// Client subscribes → Auto-charged monthly
```

### Pattern 3: E-commerce Product

```typescript
// For product sales
const invoice = await createInvoice({
  // Product details
  amount: product.price,
  currency: product.currency,
});

const checkout = await paymentsService.createCheckoutSession(invoice.id);
// Redirect to checkout
```

## Troubleshooting

### Issue: "Provider not found for currency"
- **Solution:** Check that currency is CAD, USD, or ETB
- **Check:** Provider supports the currency

### Issue: "Webhook verification failed"
- **Solution:** Check `STRIPE_WEBHOOK_SECRET` is set correctly
- **Check:** Webhook URL matches exactly in Stripe Dashboard

### Issue: "Payment not recorded"
- **Solution:** Check webhook is being received
- **Check:** API server logs for webhook errors
- **Check:** Database connection

## Next Steps

1. ✅ Set up environment variables
2. ✅ Configure webhook endpoints in provider dashboards
3. ✅ Test with test cards/accounts
4. ✅ Integrate into your frontend
5. ✅ Monitor payments in provider dashboards

---

**Your payment system is production-ready!** 🎉











