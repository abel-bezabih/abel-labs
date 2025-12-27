# 🔧 Railway Environment Variables Setup

Your API is deployed but needs environment variables. Here's how to fix it.

## 🚨 Current Issue

The API can't connect to the database because `DATABASE_URL` is missing.

## ✅ Fix: Add Environment Variables

### Step 1: Add DATABASE_URL

1. **In Railway Dashboard:**
   - Go to your **PostgreSQL service** (`abel-labs-postgres`)
   - Click on it
   - Go to **"Variables"** tab
   - Find `DATABASE_URL` - it should be there automatically
   - **Copy the value** (it looks like: `postgresql://postgres:password@host:port/railway`)

2. **Add to API Service:**
   - Go to your **API service** (`abel-labs-api`)
   - Click **"Variables"** tab
   - Click **"+ New Variable"**
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the DATABASE_URL from PostgreSQL service
   - Click **"Add"**

   **OR** (Easier way):
   - In API service → Variables tab
   - Click **"Reference Variable"**
   - Select `Postgres` → `DATABASE_URL`
   - This automatically links it!

### Step 2: Add Other Required Variables

Add these to your API service variables:

#### Essential (Required for API to work):

```bash
# Server
PORT=3001
NODE_ENV=production

# Auth (generate locally: openssl rand -base64 32)
JWT_SECRET=<paste-generated-secret-here>

# API Keys (add your actual keys)
GROQ_API_KEY=<your-groq-api-key>
```

#### Optional but Recommended:

```bash
# Redis (if you added Redis service)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# Payment Providers
STRIPE_SECRET_KEY=<your-stripe-key>
CHAPA_SECRET_KEY=<your-chapa-key>

# URLs (update after deploying frontends)
API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
CLIENT_PORTAL_URL=https://your-client-portal.vercel.app
CORS_ORIGIN=https://your-client-portal.vercel.app
```

## 🔄 Step 3: Redeploy

After adding variables:
- Railway will **automatically redeploy** your API
- Wait 1-2 minutes for redeployment
- Check the "Deployments" tab to see progress

## 🧪 Step 4: Test Again

Visit: `https://abel-labs-api-production.up.railway.app/health`

Should now return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

## 🗄️ Step 5: Run Migrations

Once API is working:

1. Go to API service → **"Deployments"** → Latest deployment
2. Click **"Shell"** tab
3. Run:
   ```bash
   yarn workspace @abel-labs/database db:migrate
   ```

## 📝 Quick Checklist

- [ ] Added `DATABASE_URL` to API service (reference from Postgres)
- [ ] Added `JWT_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Added `NODE_ENV=production`
- [ ] Added `PORT=3001`
- [ ] Added `GROQ_API_KEY` (if you have it)
- [ ] API redeployed automatically
- [ ] Health check returns `{"status":"ok","database":"connected"}`
- [ ] Ran database migrations

---

**Need help?** The most important one is `DATABASE_URL` - make sure it's added!


