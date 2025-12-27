# 🧪 Testing Guide - Verify Your Deployment

This guide will help you test your deployed Abel Labs platform to ensure everything works correctly.

## 🔍 Pre-Testing Checklist

Before testing, make sure:
- [ ] All apps are deployed (API, Client Portal, Admin Dashboard)
- [ ] Domain DNS has propagated (check at [whatsmydns.net](https://www.whatsmydns.net))
- [ ] Environment variables are set correctly
- [ ] Database migrations have run
- [ ] SSL/HTTPS is working (green padlock in browser)

---

## 1️⃣ Test Domain & DNS Connection

### Check DNS Propagation

1. **Visit [whatsmydns.net](https://www.whatsmydns.net)**
2. **Enter your domains:**
   - `yourdomain.com`
   - `www.yourdomain.com`
   - `admin.yourdomain.com`
   - `api.yourdomain.com`
3. **Verify:** All should show your server IPs (green checkmarks)

### Test Domain Access

**In your browser, visit:**
- ✅ `https://yourdomain.com` → Should load Client Portal
- ✅ `https://www.yourdomain.com` → Should redirect or load Client Portal
- ✅ `https://admin.yourdomain.com` → Should load Admin Dashboard
- ✅ `https://api.yourdomain.com` → Should show API response or docs

**Expected Results:**
- No "Connection refused" errors
- No "404 Not Found" errors
- SSL certificate is valid (green padlock)

---

## 2️⃣ Test API Server

### Health Check

**Open terminal or browser:**

```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Or visit in browser:
# https://api.yourdomain.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### API Documentation

**Visit:** `https://api.yourdomain.com/api/docs`

**Verify:**
- ✅ Swagger UI loads
- ✅ Can see all endpoints
- ✅ Can test endpoints (click "Try it out")

### Test Authentication Endpoint

```bash
# Test signup endpoint
curl -X POST https://api.yourdomain.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User",
    "role": "CLIENT"
  }'
```

**Expected:** Returns user object with JWT token

---

## 3️⃣ Test Client Portal

### Basic Access

1. **Visit:** `https://yourdomain.com`
2. **Verify:**
   - ✅ Page loads without errors
   - ✅ No console errors (F12 → Console tab)
   - ✅ Navigation works
   - ✅ Images/assets load

### Test Signup Flow

1. **Click "Sign Up"**
2. **Fill in form:**
   - Email: `testclient@example.com`
   - Password: `Test123!@#`
   - Name: `Test Client`
3. **Submit**
4. **Verify:**
   - ✅ Redirects to dashboard or login
   - ✅ No error messages
   - ✅ Check browser console for API errors

### Test Login Flow

1. **Click "Log In"**
2. **Enter credentials:**
   - Email: `testclient@example.com`
   - Password: `Test123!@#`
3. **Submit**
4. **Verify:**
   - ✅ Redirects to dashboard
   - ✅ Dashboard loads with user data
   - ✅ No authentication errors

### Test Chatbot

1. **Log in to client portal**
2. **Navigate to chat/conversation page**
3. **Send a test message:**
   ```
   "I need a website for my business"
   ```
4. **Verify:**
   - ✅ Message sends
   - ✅ AI responds
   - ✅ Conversation saves
   - ✅ No API errors in console

### Test Dashboard

1. **After logging in, check dashboard:**
   - ✅ Projects section loads
   - ✅ Invoices section loads (may be empty initially)
   - ✅ Navigation works
   - ✅ No loading errors

---

## 4️⃣ Test Admin Dashboard

### Basic Access

1. **Visit:** `https://admin.yourdomain.com`
2. **Verify:**
   - ✅ Login page loads
   - ✅ No console errors

### Test Admin Login

**First, create an admin user:**

```bash
# Via API (or use your database directly)
curl -X POST https://api.yourdomain.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "Admin123!@#",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

**Or via database:**
```sql
-- Connect to your database and run:
INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin@yourdomain.com',
  '$2b$10$hashedpassword', -- Use bcrypt to hash your password
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Then test login:**
1. **Go to:** `https://admin.yourdomain.com/login`
2. **Enter admin credentials**
3. **Verify:**
   - ✅ Redirects to dashboard
   - ✅ Dashboard loads with metrics
   - ✅ Can see all sections

### Test Admin Features

1. **Briefs Page:**
   - ✅ Can see project briefs
   - ✅ Can approve/reject briefs
   - ✅ Buttons work

2. **Projects Page:**
   - ✅ Can see all projects
   - ✅ Can view project details

3. **Invoices Page:**
   - ✅ Can see invoices
   - ✅ Can edit invoices
   - ✅ Can send invoices

---

## 5️⃣ Test Full Business Flow

### Step 1: Client Submits Brief via Chatbot

1. **As a client, log in to:** `https://yourdomain.com`
2. **Start a conversation with chatbot**
3. **Submit a project request:**
   ```
   "I need a website for my restaurant. 
   Budget is $5000. I need online ordering, menu display, 
   and contact form."
   ```
4. **Verify:**
   - ✅ Chatbot responds appropriately
   - ✅ Brief is created (check admin dashboard)

### Step 2: Admin Reviews Brief

1. **As admin, log in to:** `https://admin.yourdomain.com`
2. **Go to Briefs page**
3. **Find the new brief**
4. **Verify:**
   - ✅ Brief details are visible
   - ✅ Can see client information
   - ✅ Can see project requirements

### Step 3: Admin Approves Brief

1. **Click "Approve" on the brief**
2. **Verify:**
   - ✅ Brief status changes to "APPROVED"
   - ✅ Project is created automatically
   - ✅ Draft invoice is created (if auto-approval enabled)

### Step 4: Admin Sends Invoice

1. **Go to Projects or Invoices page**
2. **Find the invoice for the approved project**
3. **Click "Edit Invoice" (if needed)**
   - ✅ Can modify amount, items, due date
4. **Click "Send Invoice"**
5. **Verify:**
   - ✅ Invoice status changes to "SENT"
   - ✅ Email is sent to client (check email inbox)

### Step 5: Client Receives Invoice

1. **Check client email inbox**
2. **Verify:**
   - ✅ Email received
   - ✅ Invoice details in email
   - ✅ Payment link works

### Step 6: Client Makes Payment

1. **Click payment link in email OR**
2. **Log in to client portal → Dashboard → View Invoice**
3. **Click "Pay Now"**
4. **Verify:**
   - ✅ Payment page loads
   - ✅ Invoice details displayed
   - ✅ Payment form works
   - ✅ Can select payment method

### Step 7: Process Test Payment

**For Stripe (Test Mode):**
1. **Use test card:** `4242 4242 4242 4242`
2. **Any future expiry date**
3. **Any 3-digit CVC**
4. **Any ZIP code**
5. **Submit payment**
6. **Verify:**
   - ✅ Redirects to success page
   - ✅ Payment receipt email sent
   - ✅ Invoice status updates to "PAID"
   - ✅ Payment appears in admin dashboard

---

## 6️⃣ Test Payment Processing

### Stripe Test Cards

**Success:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Decline:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

### Test Payment Flow

1. **Create a test invoice** (via admin or API)
2. **Get payment link**
3. **Visit payment page**
4. **Use test card**
5. **Verify:**
   - ✅ Payment processes
   - ✅ Success page shows
   - ✅ Receipt email sent
   - ✅ Invoice marked as paid
   - ✅ Payment in history

---

## 7️⃣ Test Email Notifications

### Check Email Delivery

**Test these scenarios:**

1. **Signup Email:**
   - ✅ Create new account
   - ✅ Check email inbox
   - ✅ Verify welcome email received

2. **Invoice Email:**
   - ✅ Admin sends invoice
   - ✅ Check client email
   - ✅ Verify invoice email with PDF attachment

3. **Payment Receipt:**
   - ✅ Complete a payment
   - ✅ Check email
   - ✅ Verify receipt email with PDF

4. **Payment Reminder:**
   - ✅ Create overdue invoice (set past due date)
   - ✅ Wait for cron job (or trigger manually)
   - ✅ Check email for reminder

**Note:** If emails aren't sending, check:
- SMTP configuration in environment variables
- Email service (SendGrid/Mailgun) API keys
- Spam folder
- Email queue status (if using BullMQ)

---

## 8️⃣ Test Error Handling

### Test Invalid Scenarios

1. **Invalid Login:**
   - ✅ Wrong password shows error
   - ✅ Non-existent user shows error
   - ✅ No crashes or 500 errors

2. **Invalid Payment:**
   - ✅ Declined card shows error
   - ✅ Error message is user-friendly
   - ✅ User can retry

3. **Missing Data:**
   - ✅ Empty forms show validation errors
   - ✅ Required fields are marked
   - ✅ No crashes

---

## 9️⃣ Browser Console Check

**For each page, check browser console (F12):**

1. **No red errors**
2. **No CORS errors**
3. **No 404 errors for assets**
4. **API calls return 200/201 status**
5. **No authentication errors**

**Common Issues:**
- ❌ `CORS error` → Check `CORS_ORIGIN` in API
- ❌ `401 Unauthorized` → Check JWT token
- ❌ `404 Not Found` → Check API URL
- ❌ `Network error` → Check API is running

---

## 🔟 Performance Testing

### Page Load Times

**Test with browser DevTools (Network tab):**
- ✅ Client Portal loads in < 3 seconds
- ✅ Admin Dashboard loads in < 3 seconds
- ✅ API responses in < 500ms

### Mobile Responsiveness

**Test on different screen sizes:**
- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1920px)

**Verify:**
- ✅ Layout adapts correctly
- ✅ Buttons are clickable
- ✅ Text is readable
- ✅ Forms work on mobile

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to API"

**Check:**
1. API is running (check Railway/Render dashboard)
2. `NEXT_PUBLIC_API_URL` is set correctly
3. API URL is accessible (try in browser)
4. CORS is configured correctly

**Fix:**
```bash
# Verify API URL
curl https://api.yourdomain.com/health

# Check environment variable
# In Vercel: Settings → Environment Variables
```

### Issue: "CORS Error"

**Fix:**
Update API environment variable:
```
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
```

### Issue: "Database Connection Error"

**Check:**
1. `DATABASE_URL` is correct
2. Database is running
3. Database allows connections from your server IP
4. Migrations have run

**Fix:**
```bash
# Run migrations
railway run yarn db:migrate
# or
render run yarn db:migrate
```

### Issue: "Email Not Sending"

**Check:**
1. SMTP credentials are correct
2. Email service account is active
3. Check email queue (if using BullMQ)
4. Check spam folder

**Fix:**
- Verify SMTP settings in environment variables
- Test email service directly
- Check email service logs

---

## ✅ Final Verification Checklist

Before going live, verify:

- [ ] All domains work (main, www, admin, api)
- [ ] SSL/HTTPS is working everywhere
- [ ] Can create account and log in
- [ ] Chatbot works
- [ ] Admin can approve briefs
- [ ] Invoices can be created and sent
- [ ] Payments process successfully
- [ ] Emails are being sent
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance is acceptable
- [ ] Error handling works
- [ ] All features tested end-to-end

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

Domain Tests:
- Main domain: ✅ / ❌
- Admin subdomain: ✅ / ❌
- API subdomain: ✅ / ❌

API Tests:
- Health check: ✅ / ❌
- Authentication: ✅ / ❌
- Endpoints: ✅ / ❌

Client Portal:
- Signup: ✅ / ❌
- Login: ✅ / ❌
- Chatbot: ✅ / ❌
- Dashboard: ✅ / ❌

Admin Dashboard:
- Login: ✅ / ❌
- Briefs: ✅ / ❌
- Invoices: ✅ / ❌

Payment Flow:
- Invoice creation: ✅ / ❌
- Payment processing: ✅ / ❌
- Receipt email: ✅ / ❌

Issues Found:
1. _______________
2. _______________
3. _______________

Notes:
_______________
```

---

## 🎉 Ready for Production?

Once all tests pass:
1. ✅ Switch to production API keys (Stripe, etc.)
2. ✅ Remove any test data
3. ✅ Set up monitoring
4. ✅ Document admin credentials securely
5. ✅ Announce launch! 🚀

Good luck with testing! If you encounter any issues, refer to the troubleshooting section or check the deployment logs.




