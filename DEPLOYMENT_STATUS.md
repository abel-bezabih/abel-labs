# 🚀 Deployment Status & Next Steps

## ✅ What's Done

1. **API Deployed to Railway** ✅
   - API service: `abel-labs-api`
   - PostgreSQL database: `abel-labs-postgres`
   - URL: `https://abel-labs-api-production.up.railway.app`
   - ⚠️ **Needs**: `DATABASE_URL` environment variable (we just fixed this)

2. **Code Pushed to GitHub** ✅
   - Repository: `abel-bezabih/abel-labs`
   - Main branch ready for deployment

3. **Security Fixes** ✅
   - Next.js updated to 15.5.9
   - Build configuration fixed

---

## 🔄 Current Status

### API (Railway)
- **Status**: Deployed but needs environment variables
- **Action Required**: Add `DATABASE_URL` and other env vars (see `RAILWAY_ENV_SETUP.md`)

### Frontends (Not Deployed Yet)
- **Client Portal**: ❌ Not deployed
- **Admin Dashboard**: ❌ Not deployed

### Domain
- **Status**: ❌ Not connected
- **Action Required**: Configure DNS in Namecheap

---

## 📋 Next Steps (In Order)

### Step 1: Fix API Environment Variables ⚡ (Do This First!)

1. Go to Railway → `abel-labs-api` → Variables
2. Add `DATABASE_URL` (reference from Postgres service)
3. Add minimum required variables:
   ```
   DATABASE_URL=<from Postgres>
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=<generate with: openssl rand -base64 32>
   GROQ_API_KEY=<your-key-if-you-have-it>
   ```
4. Wait for redeploy (1-2 minutes)
5. Test: `https://abel-labs-api-production.up.railway.app/health`
6. Should return: `{"status":"ok","database":"connected"}`

### Step 2: Run Database Migrations

1. In Railway → API service → Deployments → Latest → Shell
2. Run: `yarn workspace @abel-labs/database db:migrate`
3. (Optional) Seed: `yarn workspace @abel-labs/database db:seed`

### Step 3: Deploy Client Portal to Vercel

1. **Sign up/Login to Vercel**: [vercel.com](https://vercel.com)
2. **Add New Project**:
   - Import from GitHub: `abel-bezabih/abel-labs`
   - Framework: Next.js
   - **Root Directory**: `apps/client-portal`
   - **Build Command**: `cd ../.. && yarn install && yarn turbo build --filter=@abel-labs/client-portal...`
   - **Output Directory**: `.next`
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://abel-labs-api-production.up.railway.app
   ```
4. **Deploy** → Get URL: `https://client-portal-xyz.vercel.app`

### Step 4: Deploy Admin Dashboard to Vercel

1. **Add New Project** (same repo):
   - **Root Directory**: `apps/admin-dashboard`
   - **Build Command**: `cd ../.. && yarn install && yarn turbo build --filter=@abel-labs/admin-dashboard...`
2. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://abel-labs-api-production.up.railway.app
   ```
3. **Deploy** → Get URL: `https://admin-dashboard-xyz.vercel.app`

### Step 5: Update API CORS & URLs

In Railway → API Variables, add:
```
CORS_ORIGIN=https://client-portal-xyz.vercel.app,https://admin-dashboard-xyz.vercel.app
CLIENT_PORTAL_URL=https://client-portal-xyz.vercel.app
API_URL=https://abel-labs-api-production.up.railway.app
```

### Step 6: Connect Your Domain (Namecheap)

#### For Client Portal (Main Domain)
1. In Vercel → Client Portal → Settings → Domains
2. Add: `yourdomain.com` and `www.yourdomain.com`
3. In Namecheap → Advanced DNS:
   - Add A record: `@` → `76.76.21.21` (or use Vercel nameservers)
   - Add CNAME: `www` → `cname.vercel-dns.com`

#### For Admin Dashboard (Subdomain)
1. In Vercel → Admin Dashboard → Settings → Domains
2. Add: `admin.yourdomain.com`
3. In Namecheap → Advanced DNS:
   - Add CNAME: `admin` → `cname.vercel-dns.com`

#### For API (Subdomain)
1. In Railway → API → Settings → Networking
2. Add custom domain: `api.yourdomain.com`
3. In Namecheap → Advanced DNS:
   - Add CNAME: `api` → Railway-provided domain

### Step 7: Update Environment Variables with Real Domains

After DNS propagates (24-48 hours), update:
- Railway API: `CLIENT_PORTAL_URL`, `CORS_ORIGIN`, `API_URL`
- Vercel Frontends: `NEXT_PUBLIC_API_URL`

---

## 🧪 Testing Checklist

After each step, test:

- [ ] API health check works
- [ ] Database migrations ran
- [ ] Client Portal loads
- [ ] Admin Dashboard loads
- [ ] Can register/login on Client Portal
- [ ] Can login to Admin Dashboard
- [ ] API calls work (check browser console)
- [ ] Chatbot works (if GROQ_API_KEY is set)
- [ ] Domain resolves (after DNS setup)

---

## 🎯 Current Priority

**RIGHT NOW**: Fix API environment variables (Step 1)

Once API is working, deploy frontends (Steps 3-4), then connect domain (Step 6).

---

## 📞 Quick Reference

- **Railway Dashboard**: [railway.app](https://railway.app)
- **Vercel Dashboard**: [vercel.com](https://vercel.com)
- **API URL**: `https://abel-labs-api-production.up.railway.app`
- **API Health**: `https://abel-labs-api-production.up.railway.app/health`
- **API Docs**: `https://abel-labs-api-production.up.railway.app/api/docs`

---

**Status**: API deployed, needs env vars → Frontends next → Domain last

