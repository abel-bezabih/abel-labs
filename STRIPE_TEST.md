# 🧪 Stripe Integration Test Guide

## Quick Test Script

Run this to test your Stripe integration:

```bash
node test-stripe-integration.js
```

This will check:
- ✅ API server connectivity
- ✅ Webhook endpoint accessibility
- ✅ Environment variable setup (guidance)

## Manual Testing Steps

### 1. Test Payment Link Creation

**Via API:**
```bash
# First, get a JWT token (login via API)
# Then create a payment link:
curl -X POST http://localhost:3001/payments/create-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "invoiceId": "test-invoice-id",
    "provider": "STRIPE",
    "returnUrl": "http://localhost:3000/payment-success"
  }'
```

**Expected Response:**
```json
{
  "paymentUrl": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_...",
  "provider": "STRIPE"
}
```

### 2. Test Webhook Endpoint

**Using Stripe CLI (Recommended for Local):**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/payments/webhooks/stripe
```

**Test Webhook:**
```bash
# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### 3. Test Payment Flow End-to-End

1. **Create a test invoice** (via admin dashboard or API)
2. **Create payment link** using the API endpoint above
3. **Open payment URL** in browser
4. **Use test card**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
5. **Complete payment**
6. **Check webhook** was received (check API logs)
7. **Verify payment** was recorded in database

### 4. Verify in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payments
2. You should see your test payment
3. Check webhook logs: https://dashboard.stripe.com/test/webhooks

## Common Issues

### ❌ "Invalid API Key"
- Check `STRIPE_SECRET_KEY` is set correctly
- Verify it starts with `sk_test_` or `sk_live_`
- Make sure there are no extra spaces

### ❌ "Webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify it starts with `whsec_`
- Make sure webhook URL matches exactly

### ❌ "Cannot connect to API server"
- Make sure API server is running: `yarn dev`
- Check API is on port 3001 (or your configured port)
- Verify CORS is configured correctly

### ❌ Frontend can't access publishable key
- Make sure variable name is `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Restart Next.js dev server after adding the variable
- Check browser console for errors

## Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure required |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## Success Indicators

✅ Payment link created successfully  
✅ Payment processed in Stripe  
✅ Webhook received and processed  
✅ Payment recorded in database  
✅ Invoice status updated to "PAID"  
✅ Admin notification sent  

---

**Need help?** Check the main `STRIPE_SETUP.md` guide for detailed setup instructions.












