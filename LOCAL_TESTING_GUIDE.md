# 🧪 Local Testing Guide

Quick guide to test your Abel Labs platform locally.

## 🚀 Step 1: Start Everything

### 1. Make sure Docker is running (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 2. Kill any old processes on port 3001

```bash
kill -9 $(lsof -ti :3001) 2>/dev/null || true
```

### 3. Start all services

```bash
# From the root directory
yarn dev
```

This starts:
- ✅ **API**: http://localhost:3001
- ✅ **Client Portal**: http://localhost:3000
- ✅ **Admin Dashboard**: http://localhost:3002
- ✅ **API Docs**: http://localhost:3001/api/docs

**Wait for:** You should see `🚀 API server running on http://localhost:3001` in the terminal.

---

## 🧪 Step 2: Test API Health

### Quick Health Check

**Option 1: Browser**
- Visit: http://localhost:3001/health
- Should see: `{"status":"ok","timestamp":"..."}`

**Option 2: Terminal**
```bash
curl http://localhost:3001/health
```

### API Documentation
- Visit: http://localhost:3001/api/docs
- Should see: Swagger UI with all endpoints

---

## 👤 Step 3: Test Client Portal

### 1. Visit Client Portal
- Open: http://localhost:3000
- Should see: Landing page loads without errors

### 2. Test Signup
1. Click **"Sign Up"** or go to http://localhost:3000/signup
2. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Name: `Test User`
3. Click **"Sign Up"**
4. **Expected:** Redirects to dashboard or login page

### 3. Test Login
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Click **"Log In"**
4. **Expected:** Redirects to dashboard at http://localhost:3000/dashboard

### 4. Test Dashboard
- **Check:** Projects section loads
- **Check:** Invoices section loads (may be empty)
- **Check:** No console errors (F12 → Console)

### 5. Test Chatbot
1. Go to http://localhost:3000/chat
2. Send a message: `"I need a website for my business"`
3. **Expected:** AI responds (if GROQ_API_KEY is set)
4. **Check:** Conversation saves

---

## 🔐 Step 4: Test Admin Dashboard

### 1. Create Admin User

**Option A: Via API**
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@abellabs.ca",
    "password": "Admin123!@#",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

**Option B: Via Prisma Studio**
```bash
yarn db:studio
```
Then manually create a user with role `ADMIN`.

### 2. Test Admin Login
1. Visit: http://localhost:3002/login
2. Enter:
   - Email: `admin@abellabs.ca`
   - Password: `Admin123!@#`
3. Click **"Log In"**
4. **Expected:** Redirects to admin dashboard

### 3. Test Admin Dashboard
- **Check:** Metrics load (projects, revenue, etc.)
- **Check:** Navigation works
- **Check:** No console errors

### 4. Test Briefs Page
1. Go to http://localhost:3002/briefs
2. **Check:** Briefs list loads (may be empty)
3. **Check:** Can see brief details if any exist

---

## 💬 Step 5: Test Full Business Flow

### Flow: Client → Brief → Admin → Invoice → Payment

#### 1. Client Creates Brief via Chat
1. **As client**, go to http://localhost:3000/chat
2. **Start conversation:**
   ```
   "I need a website for my restaurant. 
   Budget is $5000. I need online ordering, 
   menu display, and contact form."
   ```
3. **Wait:** Brief should be generated automatically
4. **Check:** Brief status page shows (banner appears)

#### 2. Admin Reviews Brief
1. **As admin**, go to http://localhost:3002/briefs
2. **Find:** The new brief from the client
3. **Check:** Brief details are visible
4. **Check:** Can see project requirements

#### 3. Admin Approves Brief
1. **Click "Approve"** on the brief
2. **Fill in:**
   - Budget: `5000`
   - Currency: `USD`
   - Deadline: `2025-12-31`
3. **Click "Approve Brief"**
4. **Expected:**
   - ✅ Brief status → "APPROVED"
   - ✅ Project created automatically
   - ✅ Draft invoice created

#### 4. Admin Sends Invoice
1. **Go to:** Briefs page or Projects page
2. **Find:** The invoice for the approved project
3. **Optional:** Click "Edit" to modify invoice
4. **Click "Send Invoice"**
5. **Expected:**
   - ✅ Invoice status → "SENT"
   - ✅ Email sent to client (check console/logs)

#### 5. Client Views Invoice
1. **As client**, go to http://localhost:3000/dashboard
2. **Check:** Invoice appears in invoices list
3. **Click:** "View Invoice" or "Pay Now"
4. **Expected:** Payment page loads

#### 6. Client Makes Payment (Test)
1. **On payment page**, select payment method
2. **For Stripe test:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any ZIP (e.g., `12345`)
3. **Click "Pay Now"**
4. **Expected:**
   - ✅ Redirects to success page
   - ✅ Invoice status → "PAID"
   - ✅ Payment receipt email sent (check logs)

---

## 💳 Step 6: Test Payment Features

### Test Payment History
1. **As client**, go to http://localhost:3000/payment-history
2. **Check:** Payment history loads
3. **Check:** Can filter by status/provider
4. **Check:** Can download receipts

### Test Payment Success Page
1. **After payment**, should redirect to `/payment/success?invoiceId=...`
2. **Check:** Invoice details displayed
3. **Check:** "Download PDF" button works
4. **Check:** Links to dashboard work

### Test Payment Cancel Page
1. **Cancel a payment** (or visit `/payment/cancel?invoiceId=...`)
2. **Check:** Invoice details displayed
3. **Check:** "Try Again" button works

---

## 📧 Step 7: Test Email Notifications

**Note:** Emails will log to console if SMTP is not configured.

### Check Console Logs
- Look for email logs in terminal where API is running
- Should see: `📧 Sending email to...`

### Test Scenarios:
1. **Signup Email:** Create new account → Check logs
2. **Invoice Email:** Admin sends invoice → Check logs
3. **Payment Receipt:** Complete payment → Check logs
4. **Payment Reminder:** Create overdue invoice → Check logs (cron runs daily at 9 AM)

---

## 🔍 Step 8: Check for Errors

### Browser Console (F12)
**For each page, check:**
- ✅ No red errors
- ✅ No CORS errors
- ✅ No 404 errors for assets
- ✅ API calls return 200/201 status

### Terminal Logs
**Check API terminal:**
- ✅ No unhandled exceptions
- ✅ No database connection errors
- ✅ No Redis connection errors

### Common Issues:

**❌ "Cannot connect to API"**
- Check API is running: `curl http://localhost:3001/health`
- Check `NEXT_PUBLIC_API_URL` in frontend `.env`

**❌ "CORS Error"**
- Check `CORS_ORIGIN` in API `.env`
- Should include: `http://localhost:3000,http://localhost:3002`

**❌ "401 Unauthorized"**
- Check JWT token in localStorage
- Try logging out and back in

**❌ "Database Connection Error"**
- Check Docker is running: `docker ps`
- Check `DATABASE_URL` in `.env`

---

## ✅ Quick Test Checklist

Run through this checklist:

- [ ] API health check works
- [ ] API docs load
- [ ] Client portal loads
- [ ] Can sign up new user
- [ ] Can log in
- [ ] Dashboard loads
- [ ] Chatbot works (if API key set)
- [ ] Admin dashboard loads
- [ ] Can log in as admin
- [ ] Can view briefs
- [ ] Can approve brief
- [ ] Can send invoice
- [ ] Can view invoice as client
- [ ] Can process test payment
- [ ] Payment success page works
- [ ] Payment history loads
- [ ] No console errors
- [ ] No API errors

---

## 🎯 Next Steps After Testing

1. **Fix any errors** found during testing
2. **Set up production environment variables**
3. **Deploy to production** (see `DEPLOYMENT_GUIDE.md`)
4. **Test on production** (see `TESTING_GUIDE.md`)

---

## 🆘 Need Help?

- **API not starting?** Check port 3001 is free: `lsof -i :3001`
- **Database errors?** Check Docker: `docker-compose ps`
- **Frontend errors?** Check browser console (F12)
- **API errors?** Check API terminal logs

---

**Happy Testing! 🚀**

