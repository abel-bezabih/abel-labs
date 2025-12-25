# ✅ Deployment Checklist

Use this checklist to track your deployment progress.

## 📋 Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] Database migrations ready

---

## 🚀 Step 1: API Deployment

### Railway Setup
- [ ] Signed up at railway.app
- [ ] Created new project
- [ ] Connected GitHub repository
- [ ] Added PostgreSQL database service
- [ ] Added Redis service (or use Upstash)
- [ ] Added API service with correct root directory (`apps/api`)

### API Configuration
- [ ] Set build command: `yarn install && yarn workspace @abel-labs/database db:generate && yarn workspace @abel-labs/api build`
- [ ] Set start command: `yarn workspace @abel-labs/api start:prod`
- [ ] Set all environment variables (see QUICK_DEPLOY.md)
- [ ] Deployed API successfully
- [ ] API URL obtained (e.g., `https://api-production.up.railway.app`)

### Database Setup
- [ ] Database migrations run: `yarn workspace @abel-labs/database db:migrate`
- [ ] Database seeded (optional): `yarn workspace @abel-labs/database db:seed`
- [ ] Database connection verified

### API Verification
- [ ] Health check works: `https://your-api-url/health`
- [ ] API docs accessible: `https://your-api-url/api/docs`
- [ ] CORS configured correctly

---

## 🌐 Step 2: Frontend Deployment (Vercel)

### Client Portal
- [ ] Signed up at vercel.com
- [ ] Created new project
- [ ] Connected GitHub repository
- [ ] Set root directory: `apps/client-portal`
- [ ] Set build command: `cd ../.. && yarn install && yarn build --filter=@abel-labs/client-portal`
- [ ] Set environment variable: `NEXT_PUBLIC_API_URL=https://your-api-url`
- [ ] Deployed successfully
- [ ] Client portal URL obtained

### Admin Dashboard
- [ ] Created new project in Vercel
- [ ] Connected GitHub repository
- [ ] Set root directory: `apps/admin-dashboard`
- [ ] Set build command: `cd ../.. && yarn install && yarn build --filter=@abel-labs/admin-dashboard`
- [ ] Set environment variable: `NEXT_PUBLIC_API_URL=https://your-api-url`
- [ ] Deployed successfully
- [ ] Admin dashboard URL obtained

---

## 🔗 Step 3: Domain Configuration

### Namecheap DNS Setup
- [ ] Logged into Namecheap
- [ ] Added A/CNAME record for main site (`@` or `www`)
- [ ] Added CNAME record for admin (`admin`)
- [ ] Added CNAME record for API (`api`)
- [ ] DNS propagated (waited 5-15 minutes)
- [ ] Verified domains resolve correctly

### Vercel Domain Setup
- [ ] Added main domain to client portal project
- [ ] Added admin subdomain to admin dashboard project
- [ ] SSL certificates issued (automatic)

### Railway/Render Domain Setup
- [ ] Added custom domain for API (if using Railway)
- [ ] SSL certificate configured

---

## 🔐 Step 4: Environment Variables (Production)

### API Environment Variables
- [ ] `DATABASE_URL` set
- [ ] `REDIS_HOST` and `REDIS_PORT` set
- [ ] `JWT_SECRET` set (strong random string)
- [ ] `GROQ_API_KEY` set
- [ ] `STRIPE_SECRET_KEY` set (production key)
- [ ] `CHAPA_SECRET_KEY` set
- [ ] `TELEBIRR_API_KEY` set (if using)
- [ ] `CLIENT_PORTAL_URL` set to production domain
- [ ] `API_URL` set to production API URL
- [ ] `CORS_ORIGIN` set with production domains
- [ ] `NODE_ENV=production` set
- [ ] SMTP credentials set (if using email)

### Frontend Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` set to production API URL
- [ ] Verified in both client-portal and admin-dashboard

---

## 🧪 Step 5: Testing

### API Tests
- [ ] Health endpoint: `GET /health` returns `200`
- [ ] API docs: `/api/docs` loads correctly
- [ ] Authentication: Can register and login
- [ ] Database: Can query data
- [ ] Webhooks: Endpoints accessible

### Frontend Tests
- [ ] Client portal loads: `https://yourdomain.com`
- [ ] Admin dashboard loads: `https://admin.yourdomain.com`
- [ ] No console errors in browser
- [ ] API connection works (can see data)
- [ ] Login works
- [ ] Navigation works

### Integration Tests
- [ ] Can create account
- [ ] Can login
- [ ] Can create project brief (chat)
- [ ] Admin can see briefs
- [ ] Admin can approve briefs
- [ ] Invoices can be created
- [ ] Payments can be processed (test mode)
- [ ] Emails are being sent (check logs)

---

## 🔒 Step 6: Security & Production

### Security Checklist
- [ ] SSL/HTTPS enabled everywhere (automatic on Vercel/Railway)
- [ ] Production API keys in use (not test keys)
- [ ] `NODE_ENV=production` set
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info

### Monitoring
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Logging configured
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Database backups configured

### Performance
- [ ] CDN enabled (automatic on Vercel)
- [ ] Database indexes created
- [ ] Caching configured (if needed)

---

## 📝 Step 7: Documentation

- [ ] Production URLs documented
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Team has access to deployment platforms

---

## ✅ Final Verification

- [ ] Everything works end-to-end
- [ ] No errors in production logs
- [ ] All services accessible
- [ ] Domain connected correctly
- [ ] SSL certificates valid
- [ ] Performance is acceptable

---

## 🎉 Deployment Complete!

Your platform is live! 🚀

**Next Steps:**
- Monitor for any errors
- Set up automated backups
- Configure alerts
- Plan for scaling

---

## 🆘 Rollback Plan

If something goes wrong:
1. Check deployment logs
2. Verify environment variables
3. Check database connectivity
4. Rollback to previous deployment if needed
5. Check DNS propagation if domain issues

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Production URLs**:
- Client Portal: _______________
- Admin Dashboard: _______________
- API: _______________
