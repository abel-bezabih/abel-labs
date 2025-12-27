# 🎉 Railway Deployment Successful! Next Steps

Your API and database are deployed! Here's what to do next.

## ✅ What's Done
- ✅ API deployed to Railway
- ✅ PostgreSQL database deployed
- ✅ Services are running

## 🔍 Step 1: Get Your API URL

1. **In Railway Dashboard:**
   - Go to your `abel-labs-api` service
   - Click on the service
   - Look for "Settings" → "Generate Domain" or check "Networking" tab
   - You should see a URL like: `https://abel-labs-api-production.up.railway.app`
   - **Copy this URL** - you'll need it!

2. **Test the API:**
   - Visit: `https://your-api-url/health`
   - Should return: `{"status":"ok","timestamp":"...","database":"connected"}`

## 🔐 Step 2: Set Environment Variables

Go to your API service in Railway → "Variables" tab → Add these:

### Required Variables:

```bash
# Database (Railway auto-provides this, but verify it exists)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (if you added Redis service)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# Server
PORT=3001
NODE_ENV=production

# Auth - Generate a strong secret
JWT_SECRET=<generate-random-string>
# Run this locally to generate: openssl rand -base64 32

# API Keys (add your actual keys)
GROQ_API_KEY=<your-groq-api-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# Payment Providers (ETB)
CHAPA_SECRET_KEY=<your-chapa-secret-key>
CHAPA_WEBHOOK_SECRET=<your-chapa-webhook-secret>
TELEBIRR_API_KEY=<your-telebirr-api-key>
TELEBIRR_MERCHANT_ID=<your-telebirr-merchant-id>
TELEBIRR_API_URL=https://api.telebirr.com/v1

# URLs (update after deploying frontends)
CLIENT_PORTAL_URL=https://your-client-portal.vercel.app
ADMIN_DASHBOARD_URL=https://your-admin-dashboard.vercel.app
API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=https://your-client-portal.vercel.app,https://your-admin-dashboard.vercel.app

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
SMTP_FROM=noreply@abellabs.ca
ADMIN_EMAIL=<your-admin-email>
```

**Note:** Railway will automatically redeploy when you add/change variables.

## 🗄️ Step 3: Run Database Migrations

1. **In Railway Dashboard:**
   - Go to your `abel-labs-api` service
   - Click "Deployments" tab
   - Click on the latest deployment
   - Click "Shell" tab (or "View Logs")

2. **Run migrations:**
   ```bash
   yarn workspace @abel-labs/database db:migrate
   ```

3. **Optional - Seed database:**
   ```bash
   yarn workspace @abel-labs/database db:seed
   ```

## 🌐 Step 4: Deploy Frontends to Vercel

### Deploy Client Portal

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up/login (use GitHub)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import Git Repository → Select `abel-bezabih/abel-labs`

3. **Configure:**
   - **Project Name**: `abel-labs-client-portal`
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/client-portal`
   - **Build Command**: `cd ../.. && yarn install && yarn build --filter=@abel-labs/client-portal`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `cd ../.. && yarn install`

4. **Environment Variables:**
   - Add: `NEXT_PUBLIC_API_URL=https://your-railway-api-url.up.railway.app`
   - (Use the API URL from Step 1)

5. **Deploy** → Vercel gives you a URL

### Deploy Admin Dashboard

1. **Same process**, but:
   - **Project Name**: `abel-labs-admin-dashboard`
   - **Root Directory**: `apps/admin-dashboard`
   - **Build Command**: `cd ../.. && yarn install && yarn build --filter=@abel-labs/admin-dashboard`
   - **Environment Variables**: Same `NEXT_PUBLIC_API_URL`

## 🔄 Step 5: Update API Environment Variables

After deploying frontends, update Railway API variables:

```bash
CLIENT_PORTAL_URL=https://your-client-portal.vercel.app
ADMIN_DASHBOARD_URL=https://your-admin-dashboard.vercel.app
CORS_ORIGIN=https://your-client-portal.vercel.app,https://your-admin-dashboard.vercel.app
```

Railway will auto-redeploy.

## 🧪 Step 6: Test Everything

1. ✅ **API Health**: `https://your-api-url/health`
2. ✅ **API Docs**: `https://your-api-url/api/docs`
3. ✅ **Client Portal**: Visit Vercel URL
4. ✅ **Admin Dashboard**: Visit Vercel URL
5. ✅ **Test Login**: Create account, log in
6. ✅ **Test Full Flow**: Chat → Brief → Approval → Payment

## 📝 Quick Reference

**Railway Dashboard**: https://railway.app
**Your API URL**: `https://your-api-url.up.railway.app`
**Vercel Dashboard**: https://vercel.com

---

## 🎯 Current Status

- ✅ API deployed
- ✅ Database deployed
- ⏳ Environment variables (in progress)
- ⏳ Database migrations (next)
- ⏳ Frontend deployment (next)

Let me know your API URL and we can continue!


