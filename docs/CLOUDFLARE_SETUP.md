# Cloudflare Setup for Rezvo

Complete guide to configure Cloudflare for Rezvo with CDN, DDoS protection, and optimization.

## Step 1: Add Your Site to Cloudflare

1. **Go to:** https://dash.cloudflare.com/sign-up (create account if needed)

2. **Add Site:**
   - Click "Add a Site"
   - Enter: `rezvo.co.uk`
   - Select Plan: **Free** (more than enough)
   - Click "Continue"

3. **Cloudflare Scans DNS:**
   - Wait while it scans existing records
   - Click "Continue"

## Step 2: Configure DNS Records

Add these **3 A Records:**

```
Type: A
Name: @
IPv4 address: 178.128.33.73
Proxy status: Proxied (orange cloud icon) ✓
TTL: Auto

Type: A
Name: www
IPv4 address: 178.128.33.73
Proxy status: Proxied (orange cloud icon) ✓
TTL: Auto

Type: A
Name: api
IPv4 address: 178.128.33.73
Proxy status: Proxied (orange cloud icon) ✓
TTL: Auto
```

**Important:** The orange cloud icon = "Proxied" which enables Cloudflare's CDN and protection.

## Step 3: Update Nameservers

Cloudflare will show you 2 nameservers like:
```
carly.ns.cloudflare.com
otto.ns.cloudflare.com
```

**Go to your domain registrar** (where you bought rezvo.co.uk) and:
1. Find DNS/Nameserver settings
2. Replace existing nameservers with Cloudflare's 2 nameservers
3. Save changes

**Wait:** 5 minutes to 24 hours for propagation (usually < 1 hour)

## Step 4: SSL/TLS Settings

In Cloudflare Dashboard → SSL/TLS:

### SSL/TLS Encryption Mode
- Select: **Full (strict)** ← IMPORTANT
- This ensures end-to-end encryption

### Edge Certificates
- ✅ Always Use HTTPS: **On**
- ✅ HTTP Strict Transport Security (HSTS): **Enable** (after testing)
- ✅ Minimum TLS Version: **TLS 1.2**
- ✅ Opportunistic Encryption: **On**
- ✅ TLS 1.3: **On**
- ✅ Automatic HTTPS Rewrites: **On**

## Step 5: Speed Optimization

### Auto Minify (Speed → Optimization)
- ✅ JavaScript: **On**
- ✅ CSS: **On**
- ✅ HTML: **On**

### Brotli (Speed → Optimization)
- ✅ Brotli: **On**

### Caching (Caching → Configuration)
- Caching Level: **Standard**
- Browser Cache TTL: **4 hours** (or Respect Existing Headers)

### Create Page Rule for Static Assets

Caching → Page Rules → Create Page Rule:

**Rule 1: Cache Static Files**
```
URL Pattern: *rezvo.co.uk/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month
```

**Rule 2: Cache Frontend Build**
```
URL Pattern: *rezvo.co.uk/*.js
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 week
```

**Rule 3: Don't Cache API**
```
URL Pattern: *api.rezvo.co.uk/*
Settings:
  - Cache Level: Bypass
```

## Step 6: Security Settings

### Firewall (Security → WAF)
- ✅ Web Application Firewall (WAF): **On**
- Security Level: **Medium** (or High if you get attacks)

### Bot Fight Mode (Security → Bots)
- ✅ Bot Fight Mode: **On** (Free plan)
- This blocks bad bots automatically

### DDoS Protection
- Automatically enabled (no action needed)

## Step 7: Network Settings

### HTTP/3 (Network)
- ✅ HTTP/3 (with QUIC): **On**
- ✅ 0-RTT Connection Resumption: **On**
- ✅ IPv6 Compatibility: **On**
- ✅ WebSockets: **On** (if you add real-time features later)

### gRPC (Network)
- ✅ gRPC: **On**

## Step 8: Performance Settings (Free Plan)

### Polish (Speed → Optimization)
- ✅ Polish: **Lossless** or **Lossy** (compresses images)
- ✅ WebP: **On**

### Rocket Loader (Speed → Optimization)
- ⚠️ Rocket Loader: **Off** (can break React apps)

### Mirage (Speed → Optimization)
- ✅ Mirage: **On** (lazy loads images)

## Step 9: Analytics & Monitoring

### Analytics
- View traffic, threats blocked, bandwidth saved
- Check: Analytics → Traffic, Security Events

### Email Alerts
- Security → Notifications
- Enable alerts for:
  - DDoS attacks
  - SSL certificate expiration
  - High traffic

## Step 10: Verify Setup

### Check DNS Propagation
```bash
nslookup rezvo.co.uk
nslookup www.rezvo.co.uk
nslookup api.rezvo.co.uk
```

All should return: `178.128.33.73` (might show Cloudflare IPs if proxied)

### Check SSL
Visit in browser:
- https://rezvo.co.uk
- https://www.rezvo.co.uk
- https://api.rezvo.co.uk

Should show green padlock 🔒

### Test Performance
- https://www.webpagetest.org/
- https://gtmetrix.com/

## Advanced: Custom Page Rules (Optional)

### Cache API Responses (if mostly static data)
```
URL Pattern: *api.rezvo.co.uk/directory/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 5 minutes
```

### Force HTTPS
```
URL Pattern: http://rezvo.co.uk/*
Settings:
  - Always Use HTTPS: On
```

## Cloudflare Settings Summary

**Essential (Do Now):**
- [x] DNS: 3 A Records (orange cloud = proxied)
- [x] SSL/TLS: Full (strict)
- [x] Always Use HTTPS: On
- [x] Auto Minify: All On
- [x] Brotli: On

**Security:**
- [x] WAF: On
- [x] Bot Fight Mode: On
- [x] Security Level: Medium

**Performance:**
- [x] HTTP/3: On
- [x] 0-RTT: On
- [x] Polish: On
- [x] WebP: On

**Monitoring:**
- [x] Email alerts configured

## Expected Benefits

After Cloudflare setup, you'll get:

- ⚡ **30-50% faster load times** (CDN + compression)
- 🛡️ **DDoS protection** (automatic)
- 🔒 **SSL/TLS encryption** (automatic certificate)
- 📉 **60-70% bandwidth savings** (compression)
- 🤖 **Bot protection** (blocks bad bots)
- 📊 **Analytics** (traffic, threats, performance)
- 💰 **Lower server costs** (reduced bandwidth usage)

## Troubleshooting

### DNS not propagating?
- Wait 5-10 minutes
- Clear browser cache
- Check: https://www.whatsmydns.net/

### SSL errors?
- Make sure SSL/TLS mode is "Full (strict)"
- Wait for Cloudflare SSL certificate (up to 15 mins)
- Ensure Let's Encrypt is installed on server

### Site not loading?
- Check DNS records are correct
- Ensure orange cloud is enabled (proxied)
- Check firewall rules aren't blocking

### API not working?
- Make sure API page rule bypasses cache
- Check CORS settings allow Cloudflare IPs
- Verify WebSockets are enabled if needed

## Maintenance

### Weekly:
- Check Analytics → Security Events for attacks
- Review traffic patterns

### Monthly:
- Check bandwidth savings
- Review and optimize page rules
- Update security settings if needed

## Support

- Cloudflare Docs: https://developers.cloudflare.com/
- Community: https://community.cloudflare.com/
- Status: https://www.cloudflarestatus.com/

---

## Quick Checklist

- [ ] Added rezvo.co.uk to Cloudflare
- [ ] Added 3 A Records (all proxied/orange)
- [ ] Updated nameservers at registrar
- [ ] SSL/TLS: Full (strict)
- [ ] Always Use HTTPS: On
- [ ] Auto Minify: All On
- [ ] Brotli: On
- [ ] WAF: On
- [ ] Bot Fight Mode: On
- [ ] Page Rules created
- [ ] Verified site loads with HTTPS
- [ ] Tested API endpoints
- [ ] Configured email alerts

**Status: Ready for Production** ✅
