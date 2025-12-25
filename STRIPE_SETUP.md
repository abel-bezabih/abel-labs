# 💳 Stripe Integration Setup Guide

This guide will walk you through integrating Stripe payments into your Abel Labs platform.

## ✅ What's Already Implemented

Your codebase already has:
- ✅ Stripe SDK integration
- ✅ Payment link creation for invoices
- ✅ Webhook handling for payment events
- ✅ Payment status tracking
- ✅ Support for USD and CAD currencies
- ✅ Raw body parsing for webhook signature verification

## 🔑 Required Stripe Keys (All 3!)

You need **three** Stripe keys for a complete integration:

1. **`STRIPE_SECRET_KEY`** (Backend)
   - Used by your API server for server-side operations
   - Starts with `sk_test_` or `sk_live_`
   - **Keep this secret!** Never expose in frontend code

2. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** (Frontend)
   - Used by your Next.js frontend for client-side Stripe.js
   - Starts with `pk_test_` or `pk_live_`
   - Safe to expose in browser (that's why it's "publishable")
   - Note: `NEXT_PUBLIC_` prefix is required for Next.js

3. **`STRIPE_WEBHOOK_SECRET`** (Backend)
   - Used to verify webhook signatures from Stripe
   - Starts with `whsec_`
   - Get this after setting up your webhook endpoint

## 📋 Step-by-Step Setup

### 1. Get Your Stripe API Keys

1. **Log in to Stripe Dashboard**
   - Go to https://dashboard.stripe.com
   - Make sure you're logged in to your account

2. **Get Your API Keys**
   - Click on **"Developers"** in the left sidebar
   - Click on **"API keys"**
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_` or `pk_live_`)
     - **Secret key** (starts with `sk_test_` or `sk_live_`)

3. **Test vs Live Mode**
   - **Test mode**: Use keys starting with `test_` for development
   - **Live mode**: Use keys starting with `live_` for production
   - Toggle between modes using the toggle in the top right of the dashboard

### 2. Set Up Environment Variables

Add these to your `.env` file in the project root:

```bash
# Stripe Configuration (Backend - API)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Configuration (Frontend - Client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Webhook Secret (Backend - Webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**For production**, use:
```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
```

**Important Notes:**
- `STRIPE_SECRET_KEY`: Used on the **backend** (API) for server-side operations
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Used on the **frontend** (Next.js) for client-side Stripe.js integration
- `STRIPE_WEBHOOK_SECRET`: Used on the **backend** to verify webhook signatures from Stripe
- The `NEXT_PUBLIC_` prefix makes the variable available in the browser (Next.js requirement)

### 3. Set Up Webhook Endpoint

#### For Local Development (using Stripe CLI):

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3001/payments/webhooks/stripe
   ```
   
   This will output a webhook signing secret like `whsec_...` - **copy this** and add it to your `.env` as `STRIPE_WEBHOOK_SECRET`.

#### For Production:

1. **Go to Stripe Dashboard → Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Enter your webhook URL:**
   ```
   https://yourdomain.com/payments/webhooks/stripe
   ```
4. **Select events to listen to:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. **Copy the webhook signing secret** (starts with `whsec_`) and add it to your `.env`

### 4. Test the Integration

#### Test Payment Flow:

1. **Start your API server:**
   ```bash
   yarn dev
   ```

2. **Create a test invoice** (via admin dashboard or API)

3. **Create a payment link:**
   ```bash
   curl -X POST http://localhost:3001/payments/create-link \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "invoiceId": "invoice_id_here",
       "provider": "STRIPE",
       "returnUrl": "http://localhost:3000/payment-success"
     }'
   ```

4. **Use Stripe test cards:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
   - Use any future expiry date, any 3-digit CVC, any ZIP code

#### Test Webhook:

1. **Using Stripe CLI (local):**
   ```bash
   stripe trigger checkout.session.completed
   ```

2. **Using Stripe Dashboard:**
   - Go to **Developers → Webhooks**
   - Click on your webhook endpoint
   - Click **"Send test webhook"**
   - Select `checkout.session.completed`

### 5. Supported Currencies

Your integration supports:
- **USD** (US Dollars)
- **CAD** (Canadian Dollars)

The system automatically maps your invoice currency to the correct Stripe currency code.

### 6. Payment Flow

Here's how payments work:

1. **Invoice Created** → Admin creates an invoice for a project
2. **Payment Link Generated** → Client receives payment link via API
3. **Client Pays** → Client clicks link, redirected to Stripe Checkout
4. **Payment Processed** → Stripe processes the payment
5. **Webhook Received** → Your server receives webhook notification
6. **Payment Recorded** → Payment is saved to database
7. **Invoice Updated** → Invoice status updated to "PAID" if fully paid
8. **Notifications Sent** → Admin receives email notification

### 7. API Endpoints

#### Create Payment Link
```
POST /payments/create-link
Authorization: Bearer <token>
Body: {
  "invoiceId": "string",
  "provider": "STRIPE",
  "returnUrl": "https://yourdomain.com/success"
}
```

#### Webhook Endpoint (Stripe calls this)
```
POST /payments/webhooks/stripe
Headers: {
  "stripe-signature": "t=...,v1=..."
}
```

### 8. Security Best Practices

✅ **Already Implemented:**
- Webhook signature verification
- Raw body parsing for signature validation
- Environment variable configuration
- HTTPS required for production webhooks

⚠️ **Important:**
- Never commit your secret keys to git
- Use test keys for development
- Always verify webhook signatures in production
- Use HTTPS for webhook endpoints in production

### 9. Monitoring & Debugging

#### Check Payment Status:
- Stripe Dashboard → **Payments** tab
- Your database → `Payment` table

#### View Webhook Logs:
- Stripe Dashboard → **Developers → Webhooks → [Your Endpoint] → Logs**
- Your API server console logs

#### Common Issues:

**Issue: "Webhook signature verification failed"**
- ✅ Check that `STRIPE_WEBHOOK_SECRET` is set correctly
- ✅ Ensure raw body parsing is enabled (already done in `main.ts`)
- ✅ Verify webhook URL matches exactly

**Issue: "Invalid API key"**
- ✅ Check that `STRIPE_SECRET_KEY` is set correctly (backend)
- ✅ Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly (frontend)
- ✅ Ensure you're using the right keys (test vs live)
- ✅ Make sure there are no extra spaces in the keys
- ✅ For Next.js, remember the publishable key needs `NEXT_PUBLIC_` prefix

**Issue: "Currency not supported"**
- ✅ Ensure invoice currency is USD or CAD
- ✅ Check that currency is set correctly when creating invoice

### 10. Going Live

When ready for production:

1. **Complete Stripe Account Setup:**
   - Add business information
   - Complete identity verification
   - Add bank account for payouts

2. **Switch to Live Keys:**
   - Get live API keys from dashboard
   - Update `STRIPE_SECRET_KEY` in production `.env`
   - Set up production webhook endpoint

3. **Test with Real Card:**
   - Use a real card with small amount ($1)
   - Verify webhook is received
   - Check payment appears in dashboard

4. **Monitor:**
   - Set up email alerts in Stripe Dashboard
   - Monitor webhook delivery success rate
   - Check payment success rates

## 📚 Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe Testing](https://stripe.com/docs/testing)

## 🆘 Need Help?

If you encounter issues:
1. Check Stripe Dashboard → **Developers → Logs** for API errors
2. Check your API server logs for webhook errors
3. Verify all environment variables are set correctly
4. Test with Stripe CLI to isolate issues

---

**Your Stripe integration is ready to use!** 🎉

Just add your API keys to `.env` and set up the webhook endpoint.

