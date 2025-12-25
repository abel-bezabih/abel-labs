# 🔧 Fix API Server - Step by Step

## The Problem

Your API server isn't running. Here's how to fix it:

## Step 1: Start Docker Services

**The API needs PostgreSQL and Redis to run.**

```bash
# Make sure Docker Desktop is running
# Then start services:
cd "/Users/user/Desktop/Abel Labs"
docker-compose up -d
```

**Wait for services to start**, then verify:
```bash
docker-compose ps
```

You should see:
- ✅ postgres (running)
- ✅ redis (running)

## Step 2: Check Environment Variables

Make sure your `.env` file has these required variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5433/abellabs

# JWT
JWT_SECRET=your-secret-key-here

# Redis (optional, has defaults)
REDIS_HOST=localhost
REDIS_PORT=6380

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Groq (for AI bot)
GROQ_API_KEY=gsk_...
```

## Step 3: Start the Server

```bash
cd "/Users/user/Desktop/Abel Labs"
yarn dev
```

**Look for these messages:**
- ✅ `🚀 API server running on http://localhost:3001`
- ✅ `✓ Ready in X.Xs` (for frontend)

## Step 4: Verify It's Working

**In a new terminal:**
```bash
curl http://localhost:3001/health
```

**You should get:**
```json
{"status":"ok","timestamp":"...","database":"connected"}
```

## Common Errors & Fixes

### Error: "Can't reach database server"
**Fix:** Start Docker: `docker-compose up -d`

### Error: "Redis connection failed"
**Fix:** Check Redis is running: `docker-compose ps`

### Error: "Port 3001 already in use"
**Fix:** 
```bash
kill -9 $(lsof -ti:3001)
# Then start again: yarn dev
```

### Error: "Module not found" or TypeScript errors
**Fix:**
```bash
yarn install
# Then try again: yarn dev
```

### Error: "GROQ_API_KEY is required"
**Fix:** Add `GROQ_API_KEY` to `.env` file (server should still start, but bot won't work)

## Quick Test

Once server is running:

```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return: {"status":"ok",...}
```

## Still Not Working?

**Share the error message** you see when running `yarn dev` and I'll help fix it!

---

**Most common issue:** Docker not running. Start it first! 🐳











