# 🚀 Quick Deployment Guide

Fast deployment setup for Abel Labs platform. Production environments avoid local port conflicts!

## 🎯 Quick Deploy Strategy

1. **API**: Railway or Render (free tiers available)
2. **Frontends**: Vercel (free tier, automatic deployments)
3. **Database**: Included with Railway/Render or use Supabase
4. **Redis**: Upstash (free tier) or included with Railway

---

## 📦 Step 1: Deploy API (Choose One)

### Option A: Railway (Recommended - Easiest)

1. **Go to [railway.app](https://railway.app)** and sign up

2. **Create New Project** → "Deploy from GitHub repo"

3. **Add Services:**
   - **PostgreSQL**: Click "+ New" → "Database" → "PostgreSQL"
   - **Redis**: Click "+ New" → "Database" → "Redis" 
   - **API**: Click "+ New" → "GitHub Repo" → Select your repo

4. **Configure API Service:**
   - Go to API service → Settings
   - **Root Directory**: `apps/api`
   - **Build Command**: `yarn install && yarn workspace @abel-labs/database db:generate && yarn workspace @abel-labs/api build`
   - **Start Command**: `yarn workspace @abel-labs/api start:prod`

5. **Set Environment Variables** (in API service):
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   PORT=3001
   NODE_ENV=production
   
   # Auth
   JWT_SECRET=<generate-random-string>
   
   # API Keys
   GROQ_API_KEY=<your-key>
   STRIPE_SECRET_KEY=<your-key>
   CHAPA_SECRET_KEY=<your-key>
   
   # URLs (update after deploying frontends)
   CLIENT_PORTAL_URL=https://yourdomain.com
   API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
   ```

6. **Run Migrations:**
   - Railway Dashboard → API Service → "Deployments" → Click latest deployment
   - Open "Shell" tab
   - Run: `yarn workspace @abel-labs/database db:migrate`

7. **Copy API URL**: Railway will give you something like `https://api-production.up.railway.app`

---

### Option B: Render

1. **Go to [render.com](https://render.com)** and sign up

2. **Create New Web Service:**
   - Connect GitHub repo
   - **Root Directory**: `apps/api`
   - **Build Command**: `yarn install && yarn workspace @abel-labs/database db:generate && yarn workspace @abel-labs/api build`
   - **Start Command**: `yarn workspace @abel-labs/api start:prod`
   - **Instance Type**: Free (or paid)

3. **Add PostgreSQL** (separate service)

4. **Set Environment Variables** (same as Railway above)

5. **Run Migrations**: Use Render Shell or SSH

---

## 🌐 Step 2: Deploy Frontends to Vercel

### Deploy Client Portal

1. **Go to [vercel.com](https://vercel.com)** and sign up

2. **Import Project** → Select your GitHub repo

3. **Configure:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/client-portal`
   - **Build Command**: `cd ../.. && yarn install && yarn build --filter=@abel-labs/client-portal`
   - **Output Directory**: `.next` (auto-detected)

4. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
   ```

5. **Deploy** → Vercel gives you a URL like `https://your-project.vercel.app`

### Deploy Admin Dashboard

1. **Same process**, but:
   - **Root Directory**: `apps/admin-dashboard`
   - **Build Command**: `cd ../.. && yarn install && yarn build --filter=@abel-labs/admin-dashboard`
   - **Environment Variables**: Same `NEXT_PUBLIC_API_URL`

---

## 🔗 Step 3: Connect Your Domain

### If Using Vercel:

1. **Go to Project Settings** → Domains
2. **Add Domain**: `yourdomain.com` and `admin.yourdomain.com`
3. **Follow DNS instructions**

### Configure DNS (Namecheap):

1. **Login to Namecheap** → Domain List → Manage

2. **Add Records:**

   **For Main Site:**
   - Type: `A Record` or `CNAME`
   - Host: `@` or `www`
   - Value: Vercel IP (provided by Vercel)

   **For Admin:**
   - Type: `CNAME`
   - Host: `admin`
   - Value: `cname.vercel-dns.com`

   **For API:**
   - Type: `CNAME`
   - Host: `api`
   - Value: `your-api.railway.app` (Railway's domain)

3. **Wait 5-15 minutes** for DNS propagation

---

## ✅ Step 4: Update Environment Variables

After deploying, update these URLs:

**In API (Railway/Render):**
```bash
CLIENT_PORTAL_URL=https://yourdomain.com
ADMIN_DASHBOARD_URL=https://admin.yourdomain.com
API_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
```

**In Frontends (Vercel):**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Redeploy after updating!

---

## 🧪 Step 5: Test Everything

1. ✅ **Visit**: `https://yourdomain.com` → Should load
2. ✅ **Visit**: `https://admin.yourdomain.com` → Should load
3. ✅ **Visit**: `https://api.yourdomain.com/health` → Should return `{"status":"ok"}`
4. ✅ **Test Login**: Create account, log in
5. ✅ **Test API Docs**: `https://api.yourdomain.com/api/docs`

---

## 🎉 Done!

Your platform is now live! No more local port conflicts - everything runs in production.

---

## 📝 Next Steps

- Set up monitoring (Sentry, LogRocket)
- Configure backups for database
- Set up staging environment
- Add SSL certificates (usually automatic)

---

## 🆘 Troubleshooting

**Frontend can't connect to API:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in API
- Check API is accessible publicly

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check database is running
- Run migrations: `yarn workspace @abel-labs/database db:migrate`

**Build fails:**
- Check build logs
- Verify all dependencies are in `package.json`
- Check Node version (should be 18+)

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions!

