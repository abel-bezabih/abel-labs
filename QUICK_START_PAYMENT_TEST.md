# 🚀 Quick Start: Test Payments in 3 Steps

## Step 1: Start Your Servers

**Open a terminal and run:**
```bash
cd "/Users/user/Desktop/Abel Labs"
yarn dev
```

This will start:
- ✅ API server on `http://localhost:3001`
- ✅ Frontend on `http://localhost:3000`

**Wait until you see:**
```
🚀 API server running on http://localhost:3001
✓ Ready in X.Xs (for frontend)
```

## Step 2: Create Test Invoice

**Open a NEW terminal window** (keep `yarn dev` running) and run:

### Option A: Use the Script (Easiest)
```bash
cd "/Users/user/Desktop/Abel Labs"
node create-test-invoice.js
```

The script will guide you through everything!

### Option B: Use cURL

**First, login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abellabs.ca","password":"your_actual_password"}'
```

**Copy the `accessToken` from the response, then create invoice:**
```bash
curl -X POST http://localhost:3001/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "projectId": "your_project_id",
    "amount": 100.00,
    "currency": "CAD",
    "dueDate": "2024-12-31T00:00:00Z",
    "items": [{
      "description": "Test Payment",
      "quantity": 1,
      "unitPrice": 100.00,
      "total": 100.00
    }]
  }'
```

**Copy the `id` from the response - that's your invoice ID!**

## Step 3: Test Payment

1. **Open browser:** `http://localhost:3000/test-payment`
2. **Enter invoice ID** from Step 2
3. **Click "Create Payment Checkout"**
4. **Click "Go to Payment Checkout"**
5. **Use test card:** `4242 4242 4242 4242`
6. **Complete payment** → Success! 🎉

---

## Troubleshooting

### "Failed to connect to localhost port 3001"
**Solution:** Your API server isn't running. Start it with `yarn dev`

### "Authentication failed"
**Solution:** 
- Check your email/password
- Or get token from browser: `localStorage.getItem('accessToken')`

### "Project not found"
**Solution:** You need a project ID. Get one by:
- Listing projects: `curl -X GET http://localhost:3001/projects -H "Authorization: Bearer YOUR_TOKEN"`
- Or check your database
- Or use admin dashboard

---

**That's it!** Once servers are running, the rest is easy. 🚀












