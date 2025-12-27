# 🚀 Quick Payment Test Guide

## The Correct Endpoint

**❌ Wrong:** `/cards` (doesn't exist)  
**✅ Correct:** `/payments/checkout`

## Method 1: Use Test Page (Easiest)

1. **Open:** `http://localhost:3000/test-payment`
2. **Enter invoice ID**
3. **Click "Create Payment Checkout"**

## Method 2: Use API Directly

### Step 1: Login to Get Token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@abellabs.ca",
    "password": "your_password"
  }'
```

**Copy the `accessToken` from the response.**

### Step 2: Create Checkout Session

```bash
curl -X POST http://localhost:3001/payments/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "invoiceId": "your_invoice_id_here",
    "successUrl": "http://localhost:3000/payment/success",
    "cancelUrl": "http://localhost:3000/payment/cancel"
  }'
```

**Response will include:**
- `paymentUrl` - Redirect user to this URL
- `sessionId` - Stripe session ID
- `provider` - Payment provider (STRIPE, CHAPA, etc.)

### Step 3: Open Payment URL

Copy the `paymentUrl` from the response and open it in your browser.

## Available Payment Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payments/checkout` | POST | Create checkout session for invoice |
| `/payments/subscriptions/checkout` | POST | Create subscription checkout |
| `/payments/status` | GET | Get payment status |
| `/payments/refund` | POST | Refund a payment |
| `/payments/webhooks/stripe` | POST | Stripe webhook (auto-called) |

## Common Errors

### 404 on `/cards`
**Solution:** Use `/payments/checkout` instead

### 401 Unauthorized
**Solution:** Login first and include `Authorization: Bearer TOKEN` header

### 404 Invoice Not Found
**Solution:** Make sure invoice ID is correct and exists in database

### 400 Invoice Already Paid
**Solution:** Create a new invoice or use a different invoice ID

## Quick Test Checklist

- [ ] API server running (`http://localhost:3001`)
- [ ] Frontend running (`http://localhost:3000`)
- [ ] Logged in (have accessToken)
- [ ] Have an invoice ID
- [ ] Using correct endpoint: `/payments/checkout`
- [ ] Include Authorization header with Bearer token

---

**Need an invoice?** Create one via admin dashboard or API first!











