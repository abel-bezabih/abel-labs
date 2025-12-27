# 🌐 DNS Setup Quick Reference for Namecheap

## Quick DNS Records Cheat Sheet

### Option 1: Using Vercel Nameservers (Easiest)

1. **In Vercel:**
   - Add your domain to each project
   - Vercel will show you nameservers like:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```

2. **In Namecheap:**
   - Domain List → Manage → Nameservers
   - Select "Custom DNS"
   - Enter Vercel's nameservers
   - Save

   ✅ Done! Vercel handles all DNS automatically.

---

### Option 2: Using Advanced DNS (More Control)

#### For Main Website (yourdomain.com)

**A Record for Root:**
```
Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
```

**CNAME for WWW:**
```
Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
```

#### For Admin Dashboard (admin.yourdomain.com)

**CNAME Record:**
```
Type: CNAME Record
Host: admin
Value: cname.vercel-dns.com
TTL: Automatic
```

#### For API (api.yourdomain.com)

**If using Railway:**
```
Type: CNAME Record
Host: api
Value: <your-railway-domain>.up.railway.app
TTL: Automatic
```

**If using Render:**
```
Type: CNAME Record
Host: api
Value: <your-render-domain>.onrender.com
TTL: Automatic
```

**If Railway/Render provides IP:**
```
Type: A Record
Host: api
Value: <provided-ip-address>
TTL: Automatic
```

---

## 📝 Step-by-Step in Namecheap

1. **Log in to Namecheap**
2. **Go to Domain List**
3. **Click "Manage" next to your domain**
4. **Click "Advanced DNS" tab**
5. **Add records** (click "Add New Record" button)
6. **Save changes**

---

## ⏱️ DNS Propagation

- **Usually takes:** 5 minutes to 24 hours
- **Check status:** [whatsmydns.net](https://www.whatsmydns.net)
- **Test locally:** Clear DNS cache first

**Clear DNS Cache:**
```bash
# Mac
sudo dscacheutil -flushcache

# Windows
ipconfig /flushdns

# Linux
sudo systemd-resolve --flush-caches
```

---

## 🔍 Verify DNS is Working

After 5-10 minutes, test:

```bash
# Check if domain resolves
nslookup yourdomain.com
nslookup www.yourdomain.com
nslookup admin.yourdomain.com
nslookup api.yourdomain.com

# Or use dig
dig yourdomain.com
```

---

## ⚠️ Common Mistakes

1. **Wrong TTL** → Use "Automatic" or 3600
2. **Typo in host** → `@` for root, `www` for www, `admin` for admin subdomain
3. **Wrong record type** → Use A for IPs, CNAME for domains
4. **Trailing dots** → Don't add `.` at end of values
5. **Waiting too short** → Give it at least 10-15 minutes

---

## 🆘 Still Not Working?

1. **Double-check values** - Copy/paste from Vercel/Railway exactly
2. **Check propagation** - Use whatsmydns.net
3. **Clear browser cache** - Hard refresh (Cmd+Shift+R)
4. **Try different device/network** - Rule out local DNS cache
5. **Contact support** - Namecheap support is usually helpful

---

## 📞 Getting Help

- **Namecheap Support:** [support.namecheap.com](https://support.namecheap.com)
- **Vercel DNS Docs:** [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- **Railway Custom Domains:** [docs.railway.app/develop/domains](https://docs.railway.app/develop/domains)




