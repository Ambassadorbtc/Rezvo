# Rezvo - Next Steps

Your server is deployed at **`178.128.33.73`**. Here's what to do next:

## ⏱️ Right Now (While DNS Propagates)

### 1. Test Raw IP Access

Open your browser and visit:
```
http://178.128.33.73
```

**What you should see:**
- ✅ Rezvo frontend loads (even without domain)
- ✅ Or Nginx welcome page (deployment may still be running)
- ❌ If nothing loads, check server logs

### 2. Check Backend API

```
http://178.128.33.73:8000/health
http://178.128.33.73:8000/docs
```

**Expected response:**
```json
{"status": "healthy"}
```

### 3. SSH In and Check Status

```bash
ssh root@178.128.33.73

# Check backend service
systemctl status rezvo-backend

# Check logs
journalctl -u rezvo-backend -n 50

# Check Nginx
systemctl status nginx

# Check if deployment script finished
tail -n 50 /var/log/rezvo-deploy.log
```

---

## 🌐 After 5-10 Minutes (DNS Propagation)

### 1. Verify DNS

On your **local machine**:
```bash
dig rezvo.co.uk +short
dig www.rezvo.co.uk +short
dig api.rezvo.co.uk +short
```

**All should return:** `178.128.33.73` (or Cloudflare IPs if proxied)

Or on the **server**:
```bash
ssh root@178.128.33.73
dig rezvo.co.uk +short
```

### 2. Get SSL Certificate

Once DNS returns the correct IP:

```bash
ssh root@178.128.33.73

# Option 1: Automated script
curl -fsSL https://raw.githubusercontent.com/Ambassadorbtc/Rezvo/main/scripts/setup-ssl.sh | bash

# Option 2: Manual
certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk -d api.rezvo.co.uk
```

Follow prompts:
- Enter email: `your@email.com`
- Agree to terms: `Y`
- Redirect HTTP to HTTPS: `Y` (recommended)

### 3. Restart Services

```bash
systemctl restart rezvo-backend
systemctl restart nginx
```

---

## 🔧 Configure Environment Variables

**IMPORTANT:** Set your actual API keys and secrets:

```bash
ssh root@178.128.33.73
nano /var/www/rezvo/backend/.env
```

**Required values:**
```env
# Generate a random JWT secret (use: openssl rand -hex 32)
JWT_SECRET_KEY=your-random-32-char-hex-string

# Google API keys (get from: https://console.cloud.google.com/)
GOOGLE_PLACES_API_KEY=your-actual-google-places-key
GOOGLE_MAPS_API_KEY=your-actual-google-maps-key
GOOGLE_GEOCODING_API_KEY=your-actual-geocoding-key

# Stripe keys (get from: https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_your-actual-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_live_your-actual-publishable
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email service (optional - get from: https://resend.com/)
RESEND_API_KEY=re_your-resend-key

# SMS service (optional - get from: https://www.twilio.com/)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+447700123456

# Production URLs
FRONTEND_URL=https://rezvo.co.uk
BACKEND_URL=https://api.rezvo.co.uk
ENVIRONMENT=production
```

**After editing:**
```bash
systemctl restart rezvo-backend
```

---

## 📊 Optional: Seed Database

Import UK locations and businesses from Google Places:

```bash
ssh root@178.128.33.73
cd /var/www/rezvo
sudo -u rezvo backend/venv/bin/python scripts/rezvo_seed_uk.py
```

This will:
- Import 140+ UK locations
- Fetch businesses from Google Places API
- Generate 7,140+ SEO URLs

**Note:** Requires `GOOGLE_PLACES_API_KEY` in `.env`

---

## ✅ Verification Checklist

### Server Status
```bash
# Check all services
systemctl status rezvo-backend nginx mongod

# View logs
journalctl -u rezvo-backend -f
tail -f /var/log/nginx/access.log
```

### Test Endpoints

**Health Check:**
```bash
curl https://api.rezvo.co.uk/health
```

**API Docs:**
```
https://api.rezvo.co.uk/docs
```

**Frontend:**
```
https://rezvo.co.uk
```

### Create Test Account

1. Go to: https://rezvo.co.uk/register
2. Create a diner account
3. Browse directory
4. Create an owner account
5. Complete onboarding
6. Access dashboard

---

## 🔍 Troubleshooting

### Site Not Loading?

**Check DNS:**
```bash
nslookup rezvo.co.uk
```

**Check Nginx:**
```bash
systemctl status nginx
nginx -t  # Test config
tail -f /var/log/nginx/error.log
```

**Check Firewall:**
```bash
ufw status
ufw allow 'Nginx Full'
```

### Backend Not Starting?

```bash
# Check status
systemctl status rezvo-backend

# View full logs
journalctl -u rezvo-backend -n 100

# Test manually
cd /var/www/rezvo/backend
sudo -u rezvo venv/bin/python server.py
```

### SSL Certificate Failed?

```bash
# Check DNS first
dig rezvo.co.uk +short

# Try manual certbot
certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk -d api.rezvo.co.uk

# Check Nginx config
nginx -t

# View certbot logs
cat /var/log/letsencrypt/letsencrypt.log
```

### MongoDB Connection Error?

```bash
# Check MongoDB
systemctl status mongod

# Restart MongoDB
systemctl restart mongod

# Check connection
mongosh --eval "db.adminCommand('ping')"
```

---

## 📈 Monitoring

### Daily Checks
```bash
# Check service status
systemctl status rezvo-backend

# Check disk space
df -h

# Check logs for errors
journalctl -u rezvo-backend --since "1 hour ago" | grep -i error
```

### Weekly Tasks
- Review Cloudflare analytics
- Check for security updates: `apt update && apt list --upgradable`
- Backup database: `mongodump --db=rezvo --out=/backups/$(date +%Y%m%d)`

---

## 🚀 Your Site URLs

Once everything is configured:

- **Frontend:** https://rezvo.co.uk
- **API:** https://api.rezvo.co.uk
- **API Docs:** https://api.rezvo.co.uk/docs
- **Dashboard:** https://rezvo.co.uk/dashboard

---

## 📞 Need Help?

- **GitHub:** https://github.com/Ambassadorbtc/Rezvo
- **Docs:** `/docs` folder in repository
- **Logs:** `journalctl -u rezvo-backend -f`

---

**Your Rezvo platform is ready to go live!** 🎉
