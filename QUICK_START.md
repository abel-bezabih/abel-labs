# 🚀 Quick Start Guide - Make Your First Sale!

## ✅ What We Just Built

1. **Pricing Page** - Professional pricing page at `/pricing`
2. **Enhanced Landing Page** - Better value proposition and CTAs
3. **Email Notifications** - Auto-notify when briefs are created, approved, invoices sent, payments received

## 🎯 Next Steps to Make Money

### Step 1: Add Your Groq API Key (5 minutes)

1. Get your API key from https://console.groq.com/keys
2. Add it to your `.env` file:
   ```bash
   GROQ_API_KEY=gsk_your-actual-key-here
   ```
3. Test it: Go to http://localhost:3000/chat and have a conversation!

### Step 2: Set Up Payment Providers (Critical!)

**Chapa (ETB Payments):**
1. Go to https://chapa.co
2. Sign up for merchant account
3. Get your API keys
4. Add to `.env`:
   ```bash
   CHAPA_SECRET_KEY=your-chapa-secret-key
   CHAPA_PUBLIC_KEY=your-chapa-public-key
   ```

**Stripe (USD Payments):**
1. Go to https://stripe.com
2. Create account (free)
3. Get test keys from dashboard
4. Add to `.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   ```

**Telebirr:**
1. Contact Telebirr business team
2. Apply for merchant account
3. Get API credentials
4. Add to `.env`:
   ```bash
   TELEBIRR_API_KEY=your-key
   TELEBIRR_MERCHANT_ID=your-id
   ```

### Step 3: Set Up Email (Optional but Recommended)

For production, use SendGrid or Mailgun. For now, emails will log to console.

Add to `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@abellabs.ca
ADMIN_EMAIL=your-admin-email@abellabs.ca
```

### Step 4: Test the Full Flow

1. **Start a conversation**: http://localhost:3000/chat
2. **Chat with AI**: "I need a website for my restaurant"
3. **Check admin dashboard**: http://localhost:3002/briefs
4. **Approve brief**: Set budget and deadline
5. **Create project**: From approved brief
6. **Create invoice**: For the project
7. **Test payment**: Create payment link

### Step 5: Get Your First Client! 🎉

**Today:**
1. List 10 businesses in your area that need websites
2. Email them: "Hi [Name], I noticed [business] doesn't have a website. I can build one for 50k ETB. Want a free consultation?"
3. Follow up with phone calls tomorrow

**This Week:**
- Get 3 consultations booked
- Close 1-2 deals
- **Goal: First $500-1000 in revenue!**

## 📊 Check Your Progress

Visit these URLs:
- **Client Portal**: http://localhost:3000
- **Pricing Page**: http://localhost:3000/pricing
- **Admin Dashboard**: http://localhost:3002
- **API Docs**: http://localhost:3001/api/docs

## 💰 Revenue Tracking

Track these metrics:
- Conversations started
- Briefs created
- Briefs approved
- Projects created
- Invoices sent
- Payments received

## 🎯 Your First Sale Checklist

- [ ] Groq API key added and tested
- [ ] Payment providers set up (at least Chapa or Stripe)
- [ ] Pricing page live
- [ ] Tested full flow: chat → brief → approval → invoice → payment
- [ ] Reached out to 10 potential clients
- [ ] Got first consultation booked
- [ ] Closed first deal! 🎉

## 🚨 Common Issues

**AI not responding?**
- Check Groq API key is correct
- Check you have credits in your Groq account
- Check API logs: `tail -f /tmp/api.log`

**Payments not working?**
- Make sure payment provider keys are correct
- Test with sandbox/test mode first
- Check webhook URLs are accessible

**Emails not sending?**
- In development, emails log to console (check API logs)
- For production, set up SendGrid/Mailgun

## 📞 Need Help?

Check the logs:
```bash
# API logs
tail -f /tmp/api.log

# Client portal logs (check terminal where yarn dev is running)
```

## 🎊 You're Ready!

Your platform is ready to make money. Focus on:
1. **Getting clients** (outreach, networking, referrals)
2. **Delivering quality** (happy clients = referrals)
3. **Iterating** (improve based on client feedback)

**Go get that first sale! 💪**

