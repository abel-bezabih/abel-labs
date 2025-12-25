# 🚀 Deployment Guide - Connecting Your Namecheap Domain

This guide will help you deploy your Abel Labs platform and connect your Namecheap domain.

## 📋 Overview

You have 3 main applications to deploy:
1. **Client Portal** (Next.js) - Your main website
2. **Admin Dashboard** (Next.js) - Admin management panel
3. **API Server** (NestJS) - Backend API

## 🎯 Recommended Deployment Setup

### Option 1: Vercel + Railway (Easiest & Recommended)
- **Client Portal & Admin Dashboard**: Deploy to Vercel (free tier available)
- **API Server**: Deploy to Railway or Render (free tier available)
- **Database**: Use Railway/Render PostgreSQL or Supabase (free tier)
- **Redis**: Use Upstash Redis (free tier) or Railway Redis

### Option 2: All-in-One (DigitalOcean/Render)
- Deploy everything to one platform (more control, slightly more complex)

---

## 🚀 Step-by-Step Deployment

### Part 1: Deploy API Server

#### Using Railway (Recommended)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create a new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo" (connect your GitHub account)
   - Select your Abel Labs repository

3. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will provide a `DATABASE_URL` automatically

4. **Add Redis:**
   - Click "+ New" → "Database" → "Redis"
   - Railway will provide a `REDIS_URL` automatically

5. **Deploy API:**
   - Click "+ New" → "GitHub Repo" → Select your repo
   - In settings, set:
     - **Root Directory**: `apps/api`
     - **Build Command**: `yarn install && yarn build`
     - **Start Command**: `yarn start:prod`
     - **Watch Paths**: `apps/api/**`

6. **Set Environment Variables:**
   ```
   DATABASE_URL=<from PostgreSQL service>
   REDIS_HOST=<from Redis service>
   REDIS_PORT=6379
   PORT=3001
   JWT_SECRET=<generate a strong random string>
   GROQ_API_KEY=<your-groq-api-key>
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   CHAPA_SECRET_KEY=<your-chapa-key>
   TELEBIRR_API_KEY=<your-telebirr-key>
   ADMIN_EMAIL=<your-admin-email>
   CLIENT_PORTAL_URL=https://yourdomain.com
   API_URL=https://api.yourdomain.com (or Railway URL)
   CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
   NODE_ENV=production
   ```

7. **Run Database Migrations:**
   - In Railway, go to your API service
   - Click "Deployments" → "View Logs"
   - Or use Railway CLI: `railway run yarn db:migrate`

8. **Get your API URL:**
   - Railway will give you a URL like: `https://your-api.up.railway.app`
   - **Save this URL** - you'll need it for the frontend apps

---

### Part 2: Deploy Client Portal & Admin Dashboard

#### Using Vercel (Recommended)

1. **Sign up at [vercel.com](https://vercel.com)**

2. **Deploy Client Portal:**
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `apps/client-portal`
     - **Build Command**: `cd ../.. && yarn build --filter=client-portal`
     - **Output Directory**: `.next` (default)
   
   - **Environment Variables:**
     ```
     NEXT_PUBLIC_API_URL=https://api.yourdomain.com (or Railway URL)
     ```

3. **Deploy Admin Dashboard:**
   - Click "Add New Project" again
   - Import the same repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `apps/admin-dashboard`
     - **Build Command**: `cd ../.. && yarn build --filter=admin-dashboard`
   
   - **Environment Variables:**
     ```
     NEXT_PUBLIC_API_URL=https://api.yourdomain.com (or Railway URL)
     ```

4. **Get your Vercel URLs:**
   - Client Portal: `https://client-portal-xyz.vercel.app`
   - Admin Dashboard: `https://admin-dashboard-xyz.vercel.app`
   - **Save these URLs**

---

### Part 3: Connect Your Namecheap Domain

#### For Client Portal (Main Domain)

1. **In Vercel:**
   - Go to your Client Portal project
   - Click "Settings" → "Domains"
   - Add your domain: `yourdomain.com` and `www.yourdomain.com`

2. **In Namecheap:**
   - Log in to your Namecheap account
   - Go to "Domain List" → Click "Manage" on your domain
   - Go to "Advanced DNS" tab
   - Add these DNS records:

   **For Root Domain (yourdomain.com):**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21 (Vercel's IP - check Vercel docs for current IP)
   TTL: Automatic
   ```

   **For WWW (www.yourdomain.com):**
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

   **OR use Vercel's nameservers (easier):**
   - In Namecheap, go to "Nameservers" → "Custom DNS"
   - Enter Vercel's nameservers (Vercel will show these when you add the domain)

#### For Admin Dashboard (Subdomain)

1. **In Vercel:**
   - Go to your Admin Dashboard project
   - Click "Settings" → "Domains"
   - Add: `admin.yourdomain.com`

2. **In Namecheap:**
   - Go to "Advanced DNS"
   - Add:
   ```
   Type: CNAME Record
   Host: admin
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

#### For API Server (Subdomain)

1. **In Railway:**
   - Go to your API service
   - Click "Settings" → "Networking"
   - Click "Generate Domain" or "Custom Domain"
   - Add: `api.yourdomain.com`

2. **In Namecheap:**
   - Go to "Advanced DNS"
   - Add:
   ```
   Type: CNAME Record
   Host: api
   Value: <Railway-provided-domain> (e.g., your-api.up.railway.app)
   TTL: Automatic
   ```

   **OR if Railway provides an IP:**
   ```
   Type: A Record
   Host: api
   Value: <Railway-IP-address>
   TTL: Automatic
   ```

---

### Part 4: Update Environment Variables

After setting up domains, update these:

1. **In Railway (API):**
   ```
   API_URL=https://api.yourdomain.com
   CLIENT_PORTAL_URL=https://yourdomain.com
   CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com
   ```

2. **In Vercel (Client Portal & Admin Dashboard):**
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

---

## 🔧 Alternative: Using Render

If you prefer Render over Railway:

### API Deployment on Render

1. **Sign up at [render.com](https://render.com)**

2. **Create PostgreSQL:**
   - New → PostgreSQL
   - Copy the `Internal Database URL`

3. **Create Redis:**
   - New → Redis
   - Copy connection details

4. **Create Web Service:**
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     - **Name**: abel-labs-api
     - **Root Directory**: `apps/api`
     - **Environment**: Node
     - **Build Command**: `yarn install && yarn build`
     - **Start Command**: `yarn start:prod`
   
   - **Environment Variables**: (same as Railway above)

5. **Custom Domain:**
   - In your service → Settings → Custom Domains
   - Add: `api.yourdomain.com`
   - Render will provide DNS instructions

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] API is accessible at `https://api.yourdomain.com`
- [ ] API health check: `https://api.yourdomain.com/health`
- [ ] Client Portal loads at `https://yourdomain.com`
- [ ] Admin Dashboard loads at `https://admin.yourdomain.com`
- [ ] Can log in to client portal
- [ ] Can log in to admin dashboard
- [ ] API calls work from frontend (check browser console)
- [ ] Database migrations ran successfully
- [ ] Environment variables are set correctly

---

## 🐛 Troubleshooting

### DNS Not Working?
- DNS changes can take 24-48 hours to propagate
- Check propagation: [whatsmydns.net](https://www.whatsmydns.net)
- Clear your DNS cache: `sudo dscacheutil -flushcache` (Mac)

### CORS Errors?
- Make sure `CORS_ORIGIN` in API includes all your domains
- Check that `NEXT_PUBLIC_API_URL` matches your API domain

### Database Connection Issues?
- Verify `DATABASE_URL` is correct
- Check if database allows external connections
- Ensure migrations ran: `yarn db:migrate`

### Build Failures?
- Check build logs in Vercel/Railway
- Ensure all environment variables are set
- Verify monorepo structure is correct

---

## 📞 Need Help?

Common issues:
1. **"Cannot connect to database"** → Check DATABASE_URL format
2. **"API not found"** → Verify NEXT_PUBLIC_API_URL matches API domain
3. **"CORS error"** → Update CORS_ORIGIN with all domains
4. **"404 on login"** → Check routing and environment variables

---

## 🎉 Next Steps After Deployment

1. **Test the full flow:**
   - Create a test account
   - Submit a project brief via chatbot
   - Approve it in admin dashboard
   - Send invoice
   - Process test payment

2. **Set up monitoring:**
   - Add error tracking (Sentry)
   - Set up uptime monitoring (UptimeRobot)

3. **Configure email:**
   - Set up SMTP (SendGrid, Mailgun, or Resend)
   - Update email environment variables

4. **Enable SSL/HTTPS:**
   - Vercel and Railway provide SSL automatically
   - Verify green padlock in browser

---

## 💡 Pro Tips

- Use **environment variable groups** in Vercel/Railway to share variables
- Set up **automatic deployments** from main branch
- Use **preview deployments** for testing before production
- Keep a **backup of your database** regularly
- Monitor your **API usage** to avoid hitting free tier limits

Good luck with your deployment! 🚀



