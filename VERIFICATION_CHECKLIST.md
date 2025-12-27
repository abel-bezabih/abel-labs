# ✅ Verification Checklist - Test Everything

## Step 1: Build All Packages

```bash
# From root directory
cd "/Users/user/Desktop/Abel Labs"

# Build all shared packages
yarn workspace @abel-labs/types build
yarn workspace @abel-labs/utils build
yarn workspace @abel-labs/database build
yarn workspace @abel-labs/ui build
yarn workspace @abel-labs/ai-agent build

# Or build everything at once
yarn build
```

**Expected:** No errors, all packages compile successfully.

---

## Step 2: Start Docker Services

```bash
# Make sure Docker Desktop is running
docker ps

# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker ps | grep -E "(postgres|redis)"
```

**Expected:** Both `abel-labs-postgres` and `abel-labs-redis` containers are running.

---

## Step 3: Run Database Migrations

```bash
cd packages/database
yarn prisma migrate dev
# Or if migrations already exist:
yarn prisma migrate deploy
```

**Expected:** Database schema is up to date, no errors.

---

## Step 4: Start All Services

```bash
# From root directory
cd "/Users/user/Desktop/Abel Labs"

# Start everything in development mode
yarn dev
```

**Expected:** All services start without errors:
- ✅ API server on http://localhost:3001
- ✅ Client portal on http://localhost:3000
- ✅ Admin dashboard on http://localhost:3002
- ✅ Mobile app (if testing)

---

## Step 5: Test Each Component

### 5.1 Test API Health

```bash
# Check API is running
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 5.2 Test Client Portal Pages

Open in browser: http://localhost:3000

**Check each page:**
- [ ] **Homepage** (`/`) - Loads, animations work
- [ ] **Services** (`/services`) - All services displayed
- [ ] **Pricing** (`/pricing`) - Pricing cards visible
- [ ] **About** (`/about`) - Content loads
- [ ] **Contact** (`/contact`) - Form displays
- [ ] **FAQ** (`/faq`) - Questions expand/collapse

**Check features:**
- [ ] Navigation menu works
- [ ] Footer appears on all pages
- [ ] Chat widget button appears (bottom right)
- [ ] Page transitions are smooth
- [ ] Mobile responsive (resize browser)

### 5.3 Test Chat Widget

1. Click the floating chat button (bottom right)
2. Chat window opens
3. Type a message and send
4. Check browser console for errors

**Expected:**
- Chat opens/closes smoothly
- Messages send (may fail if API not fully configured, but UI should work)
- Loading states show correctly

### 5.4 Test Admin Dashboard

Open: http://localhost:3002

**Check:**
- [ ] Dashboard loads
- [ ] Can navigate between sections
- [ ] No console errors

### 5.5 Test API Endpoints

```bash
# Test conversation creation
curl -X POST http://localhost:3001/conversations \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: Returns sessionId

# Test health check
curl http://localhost:3001/health

# Test leads endpoint
curl -X POST http://localhost:3001/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "project": "Test project"
  }'
```

---

## Step 6: Check for Errors

### 6.1 Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Visit each page
4. Look for red errors

**Expected:** No errors, only warnings (if any)

### 6.2 Check API Logs

```bash
# If running in terminal, check for errors
# Look for:
# - TypeScript errors
# - Database connection errors
# - API errors
```

### 6.3 Check TypeScript Compilation

```bash
# Check for TypeScript errors
yarn workspace @abel-labs/client-portal tsc --noEmit
yarn workspace @abel-labs/api tsc --noEmit
```

**Expected:** No TypeScript errors

### 6.4 Check Linter

```bash
# Run linter on all packages
yarn lint
```

**Expected:** No linting errors (or only minor warnings)

---

## Step 7: Test Key Features

### 7.1 Contact Form

1. Go to http://localhost:3000/contact
2. Fill out the form
3. Submit
4. Check API logs for the request

**Expected:** Form submits, success message shows

### 7.2 Chat Flow (If API Configured)

1. Open chat widget
2. Send message: "I need a website"
3. Wait for AI response
4. Continue conversation

**Expected:** AI responds (if GROQ_API_KEY is set)

### 7.3 Navigation

1. Click through all nav items
2. Check URLs change correctly
3. Verify active state highlights

**Expected:** All links work, active states show

---

## Step 8: Environment Variables Check

```bash
# Check .env file exists
cat .env | grep -E "(GROQ|STRIPE|CHAPA|DATABASE|REDIS)"

# Verify required variables are set:
# - GROQ_API_KEY (for AI)
# - DATABASE_URL (for database)
# - REDIS_HOST, REDIS_PORT (for Redis)
```

**Note:** Payment keys (Stripe, Chapa) can be empty for now, but API will show warnings.

---

## Quick Verification Script

Save this as `verify.sh`:

```bash
#!/bin/bash

echo "🔍 Verifying Abel Labs Setup..."
echo ""

echo "1. Checking Docker..."
docker ps | grep -E "(postgres|redis)" && echo "✅ Docker OK" || echo "❌ Docker not running"

echo ""
echo "2. Checking API..."
curl -s http://localhost:3001/health > /dev/null && echo "✅ API OK" || echo "❌ API not responding"

echo ""
echo "3. Checking Client Portal..."
curl -s http://localhost:3000 > /dev/null && echo "✅ Client Portal OK" || echo "❌ Client Portal not responding"

echo ""
echo "4. Checking Admin Dashboard..."
curl -s http://localhost:3002 > /dev/null && echo "✅ Admin Dashboard OK" || echo "❌ Admin Dashboard not responding"

echo ""
echo "5. Checking TypeScript..."
cd apps/client-portal && yarn tsc --noEmit > /dev/null 2>&1 && echo "✅ TypeScript OK" || echo "❌ TypeScript errors"

echo ""
echo "✅ Verification complete!"
```

Run with: `chmod +x verify.sh && ./verify.sh`

---

## Common Issues & Fixes

### Issue: "Cannot connect to database"
**Fix:** Start Docker: `docker-compose up -d`

### Issue: "API not responding"
**Fix:** Check API logs, ensure `.env` has required keys

### Issue: "Port already in use"
**Fix:** Kill process on that port or change port in config

### Issue: "Module not found"
**Fix:** Run `yarn install` and rebuild packages

### Issue: "TypeScript errors"
**Fix:** Run `yarn build` to compile all packages

---

## ✅ Success Criteria

Everything is working if:
- ✅ All services start without errors
- ✅ All pages load in browser
- ✅ No console errors
- ✅ Navigation works
- ✅ Chat widget opens/closes
- ✅ Forms submit (may need API keys for full functionality)
- ✅ No TypeScript/linting errors

---

## Next Steps After Verification

Once everything is verified:
1. Set up payment API keys (Chapa, Stripe)
2. Configure email (SendGrid/Gmail)
3. Test complete flow end-to-end
4. Deploy to production













