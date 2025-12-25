# 🧪 How to Test Payments on Your Website

## Quick Test Guide

I've created a test page for you to easily test the payment system. Here's how to use it:

## Step 1: Access the Test Page

1. **Start your development servers:**
   ```bash
   yarn dev
   ```

2. **Open your browser:**
   ```
   http://localhost:3000/test-payment
   ```

## Step 2: Create a Test Invoice

Before testing, you need an invoice. You can create one via:

### Option A: Admin Dashboard (if you have one)
- Create a project
- Create an invoice for that project
- Copy the invoice ID

### Option B: API Directly

```bash
# First, login to get a token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@abellabs.ca",
    "password": "your_password"
  }'

# Copy the accessToken from response

# Create a test invoice
curl -X POST http://localhost:3001  /invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId": "project_id_here",
    "invoiceNumber": "TEST-001",
    "amount": 100.00,
    "currency": "CAD",
    "dueDate": "2024-12-31",
    "items": [
      {
        "description": "Test Payment",
        "quantity": 1,
        "unitPrice": 100.00,
        "total": 100.00
      }
    ]
  }'

# Copy the invoice ID from response
```

### Option C: Use Existing Invoice

If you already have invoices in your database, you can use one of those.

## Step 3: Test the Payment Flow

1. **Go to:** `http://localhost:3000/test-payment`
x`
2. **Enter the invoice ID** you created/copied

3. **Click "Create Payment Checkout"**

4. **You'll see:**
   - ✅ Success message with provider info
   - Button to "Go to Payment Checkout"

5. **Click "Go to Payment Checkout"**
   - You'll be redirected to Stripe (if CAD/USD) or Chapa (if ETB)

6. **Use Test Card:**
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., 12/25)
   - **CVC:** Any 3 digits (e.g., 123)
   - **ZIP:** Any 5 digits (e.g., 12345)

7. **Complete Payment:**
   - Click "Pay"
   - You'll be redirected back to `/payment/success`

## Step 4: Verify Payment

### Check Database

```bash
# Check if payment was recorded
# Query your Payment table in the database
```

### Check API Logs

Look for:
- ✅ "Checkout session created"
- ✅ "Webhook received"
- ✅ "Payment recorded"
- ✅ "Invoice marked as PAID"

### Check Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/payments
2. You should see your test payment
3. Check webhook logs: https://dashboard.stripe.com/test/webhooks

## Testing Different Scenarios

### Test 1: CAD Payment (Stripe)

1. Create invoice with `currency: "CAD"`
2. Test payment → Should route to Stripe
3. Use test card `4242 4242 4242 4242`

### Test 2: USD Payment (Stripe)

1. Create invoice with `currency: "USD"`
2. Test payment → Should route to Stripe
3. Use test card `4242 4242 4242 4242`

### Test 3: ETB Payment (Chapa)

1. Create invoice with `currency: "ETB"`
2. Test payment → Should route to Chapa
3. Use Chapa test credentials (if available)

### Test 4: Payment Cancellation

1. Start payment flow
2. Click "Cancel" on Stripe checkout
3. Should redirect to `/payment/cancel`

### Test 5: Failed Payment

1. Use decline card: `4000 0000 0000 0002`
2. Payment should fail
3. Check error handling

## Troubleshooting

### Issue: "Authentication failed"

**Solution:**
- Make sure you're logged in
- Check `localStorage.getItem('accessToken')` in browser console
- If no token, login first via your auth system

### Issue: "Invoice not found"

**Solution:**
- Check the invoice ID is correct
- Verify invoice exists in database
- Check invoice belongs to your account

### Issue: "Failed to create payment checkout"

**Solution:**
- Check API server is running
- Check API logs for errors
- Verify environment variables are set:
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`

### Issue: "Webhook not received"

**Solution:**
- For local testing, use Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3001/payments/webhooks/stripe
  ```
- Check webhook URL is correct
- Verify webhook secret is set

## Quick Test Checklist

- [ ] API server running (`yarn dev`)
- [ ] Frontend running (`http://localhost:3000`)
- [ ] Logged in (have accessToken)
- [ ] Created test invoice
- [ ] Accessed `/test-payment` page
- [ ] Created checkout session
- [ ] Redirected to Stripe/Chapa
- [ ] Used test card
- [ ] Payment completed
- [ ] Redirected to success page
- [ ] Payment recorded in database
- [ ] Invoice status updated to PAID

## Test Cards (Stripe)

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure required |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiry date, any 3-digit CVC, any ZIP code.

## Next Steps After Testing

Once testing is successful:

1. ✅ Integrate payment into your actual invoice pages
2. ✅ Add payment buttons to project pages
3. ✅ Set up production webhooks
4. ✅ Test with real (small) amounts
5. ✅ Monitor payment dashboard

---

**Happy Testing!** 🎉

If you encounter any issues, check:
- API server logs
- Browser console
- Stripe Dashboard webhook logs
- Database payment records

