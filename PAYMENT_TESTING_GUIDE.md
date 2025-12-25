# 💳 Payment Integration Testing Guide

Complete guide for testing all payment providers (Stripe, Chapa, Telebirr).

## 🔧 Setup Requirements

### Environment Variables

Add these to your `.env` file:

```bash
# Stripe (USD/CAD)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from Stripe Dashboard → Webhooks

# Chapa (ETB)
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
CHAPA_WEBHOOK_SECRET=your_chapa_webhook_secret  # Optional but recommended

# Telebirr (ETB)
TELEBIRR_API_KEY=your_telebirr_api_key
TELEBIRR_MERCHANT_ID=your_merchant_id
TELEBIRR_WEBHOOK_SECRET=your_telebirr_webhook_secret  # Optional but recommended
TELEBIRR_API_URL=https://api.telebirr.com/v1  # Adjust based on actual API

# API Configuration
API_URL=http://localhost:3001  # Your API URL
CLIENT_PORTAL_URL=http://localhost:3000  # Your frontend URL
```

---

## 🧪 Testing Stripe Payments

### 1. Test Card Numbers

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any ZIP code (e.g., `12345`)

**Decline:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

### 2. Test Flow

1. **Create an invoice** (via admin dashboard or API)
2. **Go to payment page** (client portal)
3. **Select Stripe** as payment method
4. **Use test card** `4242 4242 4242 4242`
5. **Complete payment**
6. **Verify:**
   - ✅ Redirects to success page
   - ✅ Invoice status → `PAID`
   - ✅ Payment record created
   - ✅ Receipt email sent

### 3. Webhook Testing

**Using Stripe CLI (Recommended):**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/payments/webhooks/stripe
```

**Using Stripe Dashboard:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api-url.com/payments/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Testing Chapa Payments (ETB)

### 1. Test Account Setup

1. **Sign up** at https://chapa.co
2. **Get API keys** from dashboard
3. **Add to `.env`**:
   ```bash
   CHAPA_SECRET_KEY=your_secret_key
   CHAPA_PUBLIC_KEY=your_public_key
   ```

### 2. Test Flow

1. **Create an invoice** with currency `ETB`
2. **Go to payment page**
3. **Select Chapa** as payment method
4. **Complete payment** (use test mode if available)
5. **Verify:**
   - ✅ Redirects to success page
   - ✅ Invoice status → `PAID`
   - ✅ Payment record created
   - ✅ Receipt email sent

### 3. Webhook Testing

**Setup Webhook URL:**
1. Go to Chapa Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-api-url.com/payments/webhooks/chapa`
3. Copy webhook secret to `CHAPA_WEBHOOK_SECRET` (if provided)

**Test Webhook:**
```bash
# Test webhook endpoint
curl -X POST http://localhost:3001/payments/webhooks/chapa \
  -H "Content-Type: application/json" \
  -H "chapa-signature: test_signature" \
  -d '{
    "status": "success",
    "tx_ref": "chapa_invoice123_1234567890",
    "transaction_id": "chapa_txn_123",
    "amount": "1000",
    "currency": "ETB"
  }'
```

**Signature Verification:**
- Chapa uses HMAC-SHA256 for webhook signatures
- Signature is verified automatically if `CHAPA_WEBHOOK_SECRET` is set
- In development, webhooks work without verification (warning logged)

---

## 🧪 Testing Telebirr Payments (ETB)

### 1. Test Account Setup

1. **Contact Telebirr** business team for merchant account
2. **Get API credentials**:
   - `TELEBIRR_API_KEY`
   - `TELEBIRR_MERCHANT_ID`
3. **Add to `.env`**

### 2. Test Flow

1. **Create an invoice** with currency `ETB`
2. **Go to payment page**
3. **Select Telebirr** as payment method
4. **Complete payment** (use test mode if available)
5. **Verify:**
   - ✅ Redirects to success page
   - ✅ Invoice status → `PAID`
   - ✅ Payment record created
   - ✅ Receipt email sent

### 3. Webhook Testing

**Setup Webhook URL:**
1. Configure in Telebirr merchant dashboard
2. Add webhook URL: `https://your-api-url.com/payments/webhooks/telebirr`
3. Copy webhook secret to `TELEBIRR_WEBHOOK_SECRET` (if provided)

**Test Webhook:**
```bash
# Test webhook endpoint
curl -X POST http://localhost:3001/payments/webhooks/telebirr \
  -H "Content-Type: application/json" \
  -H "telebirr-signature: test_signature" \
  -d '{
    "orderId": "telebirr_invoice123_1234567890",
    "status": "SUCCESS",
    "amount": "1000",
    "currency": "ETB"
  }'
```

**Note:** Telebirr API structure may vary. Adjust implementation based on official documentation.

---

## ✅ End-to-End Test Checklist

### Test Scenario 1: Stripe Payment (USD)

- [ ] Create invoice with currency `USD`
- [ ] Client views invoice
- [ ] Client clicks "Pay Now"
- [ ] Selects Stripe payment method
- [ ] Redirects to Stripe Checkout
- [ ] Uses test card `4242 4242 4242 4242`
- [ ] Payment succeeds
- [ ] Redirects to success page
- [ ] Invoice status → `PAID`
- [ ] Payment record created
- [ ] Receipt email sent
- [ ] Payment appears in admin dashboard
- [ ] Payment appears in client payment history

### Test Scenario 2: Chapa Payment (ETB)

- [ ] Create invoice with currency `ETB`
- [ ] Client views invoice
- [ ] Client clicks "Pay Now"
- [ ] Selects Chapa payment method
- [ ] Redirects to Chapa checkout
- [ ] Completes payment
- [ ] Webhook received and processed
- [ ] Invoice status → `PAID`
- [ ] Payment record created
- [ ] Receipt email sent

### Test Scenario 3: Telebirr Payment (ETB)

- [ ] Create invoice with currency `ETB`
- [ ] Client views invoice
- [ ] Client clicks "Pay Now"
- [ ] Selects Telebirr payment method
- [ ] Redirects to Telebirr checkout
- [ ] Completes payment
- [ ] Webhook received and processed
- [ ] Invoice status → `PAID`
- [ ] Payment record created
- [ ] Receipt email sent

### Test Scenario 4: Payment Failure

- [ ] Use declined card (Stripe: `4000 0000 0000 0002`)
- [ ] Payment fails
- [ ] Error message displayed
- [ ] Invoice status remains `SENT` or `OVERDUE`
- [ ] No payment record created
- [ ] User can retry payment

### Test Scenario 5: Webhook Signature Verification

- [ ] Send webhook with invalid signature
- [ ] Webhook rejected
- [ ] Error logged
- [ ] Send webhook with valid signature
- [ ] Webhook processed successfully

---

## 🔍 Debugging Tips

### Check API Logs

```bash
# Watch API logs
tail -f logs/api.log  # or check terminal where yarn dev is running
```

Look for:
- `✅ Checkout session created`
- `✅ Webhook received`
- `✅ Payment processed`
- `❌ Error messages`

### Test Webhook Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Test webhook endpoint (without signature)
curl -X POST http://localhost:3001/payments/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Common Issues

**Issue: "CHAPA_SECRET_KEY not set"**
- ✅ Add `CHAPA_SECRET_KEY` to `.env`
- ✅ Restart API server

**Issue: "Webhook signature verification failed"**
- ✅ Check `CHAPA_WEBHOOK_SECRET` or `STRIPE_WEBHOOK_SECRET` is correct
- ✅ Verify webhook payload matches expected format
- ✅ Check signature header name (chapa-signature, stripe-signature)

**Issue: "Payment not updating invoice status"**
- ✅ Check webhook is being received (check logs)
- ✅ Verify webhook payload structure
- ✅ Check invoice ID extraction from transaction ID

**Issue: "Telebirr API error"**
- ✅ Verify `TELEBIRR_API_URL` is correct
- ✅ Check API key and merchant ID
- ✅ Adjust request format based on Telebirr documentation

---

## 📝 Production Checklist

Before going live:

- [ ] Replace test API keys with production keys
- [ ] Set up production webhook URLs
- [ ] Test webhook signature verification
- [ ] Configure webhook secrets
- [ ] Test payment flow end-to-end
- [ ] Set up payment reconciliation
- [ ] Configure error monitoring
- [ ] Test refund process (if needed)
- [ ] Document payment provider contacts
- [ ] Set up payment alerts/notifications

---

## 🚀 Next Steps

After payment integration is complete:

1. **Deploy to production** (see `DEPLOYMENT_GUIDE.md`)
2. **Set up monitoring** for payment failures
3. **Configure alerts** for failed payments
4. **Test with real transactions** (small amounts first)
5. **Monitor payment success rates**

---

**Need Help?**
- Check API logs for detailed error messages
- Review payment provider documentation
- Test webhook endpoints individually
- Contact payment provider support if needed

