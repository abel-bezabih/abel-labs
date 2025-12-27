# 🚀 Deployment Next Steps

Your code is now on GitHub! Here's what to do next.

## ✅ What's Done
- ✅ Code pushed to GitHub: `https://github.com/abel-bezabih/abel-labs`
- ✅ Repository is ready for deployment

## 🎯 Next: Deploy to Production

### Step 1: Deploy API (Choose One Platform)

#### Option A: Railway (Recommended - Easiest)

1. **Go to [railway.app](https://railway.app)**
   - Sign up/login (can use GitHub login)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access GitHub
   - Select repository: `abel-bezabih/abel-labs`

3. **Add PostgreSQL Database**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will automatically provide `DATABASE_URL`

4. **Add Redis** (Optional but recommended)
   - Click "+ New" → "Database" → "Redis"
   - Railway will provide `REDIS_URL`

5. **Configure API Service**
   - Railway should auto-detect your API
   - Go to API service → Settings
   - **Root Directory**: `apps/api`
   - **Build Command**: `yarn install && yarn workspace @abel-labs/database db:generate && yarn workspace @abel-labs/api build`
   - **Start Command**: `yarn workspace @abel-labs/api start:prod`

6. **Set Environment Variables**
   - Go to API service → Variables tab
   - Add these variables:
   
   ```bash
   # Database (Railway auto-provides these)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   
   # Server
   PORT=3001
   NODE_ENV=production
   
   # Auth
   JWT_SECRET=<generate-a-random-string-here>
   # Tip: Run this to generate: openssl rand -base64 32
   
   # API Keys (add your actual keys)
   GROQ_API_KEY=<your-groq-api-key>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   CHAPA_SECRET_KEY=<your-chapa-secret-key>
   CHAPA_WEBHOOK_SECRET=<your-chapa-webhook-secret>
   TELEBIRR_API_KEY=<your-telebirr-api-key>
   TELEBIRR_MERCHANT_ID=<your-telebirr-merchant-id>
   
   # URLs (update after deploying frontends)
   CLIENT_PORTAL_URL=https://yourdomain.com
   ADMIN_DASHBOARD_URL=https://admin.yourdomain.com
   API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
   
   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<your-email>
   SMTP_PASS=<your-app-password>
   SMTP_FROM=noreply@abellabs.ca
   ADMIN_EMAIL=<your-admin-email>
   ```

7. **Deploy**
   - Railway will automatically deploy when you push to `main` branch
   - Or click "Deploy" button
   - Wait for build to complete

8. **Run Database Migrations**
   - Go to API service → "Deployments" tab
   - Click on latest deployment
   - Click "Shell" tab
   - Run: `yarn workspace @abel-labs/database db:migrate`
   - (Optional) Run: `yarn workspace @abel-labs/database db:seed`

9. **Get API URL**
   - Railway will give you a URL like: `https://abel-labs-api-production.up.railway.app`
   - **Save this URL** - you'll need it for frontend deployment

---

#### Option B: Render

1. **Go to [render.com](https://render.com)**
   - Sign up/login (can use GitHub login)

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub account
   - Select repository: `abel-bezabih/abel-labs`

3. **Configure Service**
   - **Name**: `abel-labs-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn workspace @abel-labs/database db:generate && yarn workspace @abel-labs/api build`
   - **Start Command**: `yarn workspace @abel-labs/api start:prod`
   - **Instance Type**: Free (or paid for better performance)

4. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: `abel-labs-postgres`
   - Copy the `Internal Database URL`

5. **Set Environment Variables** (same as Railway above)

6. **Deploy and Run Migrations** (same as Railway)

---

### Step 2: Deploy Frontends to Vercel

#### Deploy Client Portal

1. **Go to [vercel.com](https://vercel.com)**
   - Sign up/login (can use GitHub login)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import Git Repository → Select `abel-bezabih/abel-labs`

3. **Configure Project**
   - **Project Name**: `abel-labs-client-portal` (or your choice)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `apps/client-portal`
   - **Build Command**: `cd ../.. && yarn install && yarn build --filter=@abel-labs/client-portal`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `cd ../.. && yarn install`

4. **Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
     ```
   - (Update this after you get your API URL from Railway/Render)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Vercel gives you: `https://abel-labs-client-portal.vercel.app`

#### Deploy Admin Dashboard

1. **Same process**, but:
   - **Project Name**: `abel-labs-admin-dashboard`
   - **Root Directory**: `apps/admin-dashboard`
   - **Build Command**: `cd ../.. && yarn install && yarn build --filter=@abel-labs/admin-dashboard`
   - **Environment Variables**: Same `NEXT_PUBLIC_API_URL`

---

### Step 3: Update Environment Variables

After deploying frontends, update API environment variables:

**In Railway/Render API service:**
```bash
CLIENT_PORTAL_URL=https://your-client-portal.vercel.app
ADMIN_DASHBOARD_URL=https://your-admin-dashboard.vercel.app
CORS_ORIGIN=https://your-client-portal.vercel.app,https://your-admin-dashboard.vercel.app
```

**In Vercel (both frontends):**
```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

Then redeploy all services.

---

### Step 4: Connect Your Domain (Optional but Recommended)

See `DEPLOYMENT_GUIDE.md` for detailed domain setup instructions.

---

## 🧪 Testing After Deployment

1. ✅ **API Health**: `https://your-api-url/health`
2. ✅ **API Docs**: `https://your-api-url/api/docs`
3. ✅ **Client Portal**: Visit Vercel URL
4. ✅ **Admin Dashboard**: Visit Vercel URL
5. ✅ **Test Login**: Create account, log in
6. ✅ **Test Full Flow**: Chat → Brief → Approval → Payment

---

## 📝 Quick Reference

**Your GitHub Repo**: `https://github.com/abel-bezabih/abel-labs`

**Deployment Platforms**:
- Railway: https://railway.app
- Render: https://render.com
- Vercel: https://vercel.com

**Documentation**:
- Full Guide: `DEPLOYMENT_GUIDE.md`
- Quick Guide: `QUICK_DEPLOY.md`
- Checklist: `DEPLOYMENT_CHECKLIST.md`

---

## 🎉 Ready to Deploy!

Start with Railway for the API, then Vercel for frontends. Let me know when you've deployed and we can test everything!


