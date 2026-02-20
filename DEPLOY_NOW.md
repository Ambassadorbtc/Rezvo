# Deploy Rezvo to DigitalOcean - Quick Guide

## Step 1: Create DigitalOcean Droplet

1. **Go to DigitalOcean:** https://cloud.digitalocean.com/droplets/new

2. **Choose Options:**
   - **Image:** Ubuntu 22.04 LTS (x64)
   - **Droplet Type:** Basic
   - **CPU:** Regular (2 GB RAM / 1 vCPU minimum, 4 GB recommended)
   - **Datacenter:** London - LON1
   - **Authentication:** SSH Key (add your public key)
   - **Hostname:** rezvo-production

3. **Click "Create Droplet"** - Wait ~1 minute for it to spin up

4. **Note your droplet's IP address**

## Step 2: Point Domain to Server

Configure DNS for `rezvo.co.uk` (or your domain):

### At Your Domain Registrar or Cloudflare:

```
A Record:  rezvo.co.uk        →  YOUR_DROPLET_IP
A Record:  www.rezvo.co.uk    →  YOUR_DROPLET_IP
A Record:  api.rezvo.co.uk    →  YOUR_DROPLET_IP
```

## Step 3: Deploy in One Command

SSH into your droplet and run the automated deployment script:

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Download and run deployment script
curl -fsSL https://raw.githubusercontent.com/Ambassadorbtc/Rezvo/main/scripts/deploy-to-digitalocean.sh | bash

# Or clone and run locally:
git clone https://github.com/Ambassadorbtc/Rezvo.git
cd Rezvo
chmod +x scripts/deploy-to-digitalocean.sh
./scripts/deploy-to-digitalocean.sh
```

The script will:
- ✅ Install Python 3.11, Node.js 18, MongoDB 7.0, Nginx
- ✅ Clone the Rezvo repository
- ✅ Set up backend virtual environment
- ✅ Install all dependencies
- ✅ Build frontend for production
- ✅ Create systemd service
- ✅ Configure Nginx
- ✅ Set up firewall
- ✅ Start all services

## Step 4: Configure Environment Variables

```bash
# Edit .env file with your credentials
sudo nano /var/www/rezvo/backend/.env
```

**Required values:**
```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=rezvo

JWT_SECRET_KEY=your-super-secret-jwt-key-change-this

GOOGLE_PLACES_API_KEY=your-google-places-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_GEOCODING_API_KEY=your-google-geocoding-api-key

STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

RESEND_API_KEY=re_your_resend_api_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+447700123456

FRONTEND_URL=https://rezvo.co.uk
BACKEND_URL=https://api.rezvo.co.uk
ENVIRONMENT=production
```

**After editing, restart backend:**
```bash
sudo systemctl restart rezvo-backend
```

## Step 5: Get SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk -d api.rezvo.co.uk
```

Follow prompts:
- Enter email address
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Auto-renewal is configured automatically!

## Step 6: Seed Database (Optional)

```bash
cd /var/www/rezvo
sudo -u rezvo backend/venv/bin/python scripts/rezvo_seed_uk.py
```

This will import:
- 140+ UK locations
- Businesses from Google Places API
- Generate 7,140+ SEO URLs

## Step 7: Verify Deployment

**Check services:**
```bash
# Backend API status
sudo systemctl status rezvo-backend

# Nginx status
sudo systemctl status nginx

# MongoDB status
sudo systemctl status mongod
```

**View logs:**
```bash
# Backend logs (live)
sudo journalctl -u rezvo-backend -f

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# Nginx access log
sudo tail -f /var/log/nginx/access.log
```

**Test endpoints:**
```bash
# Health check
curl https://api.rezvo.co.uk/health

# API docs
curl https://api.rezvo.co.uk/docs
```

## Step 8: Access Your Application

🎉 **Your platform is live!**

- **Frontend:** https://rezvo.co.uk
- **API:** https://api.rezvo.co.uk
- **API Docs:** https://api.rezvo.co.uk/docs

## Monitoring & Maintenance

### View Logs
```bash
# Backend logs
sudo journalctl -u rezvo-backend -f

# All logs from last hour
sudo journalctl -u rezvo-backend --since "1 hour ago"

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update Application
```bash
cd /var/www/rezvo

# Pull latest code
sudo -u rezvo git pull

# Update backend
cd backend
sudo -u rezvo venv/bin/pip install -r requirements.txt
sudo systemctl restart rezvo-backend

# Update frontend
cd ../frontend
sudo -u rezvo npm install
sudo -u rezvo npm run build

# Restart services
sudo systemctl restart rezvo-backend nginx
```

### Backup Database
```bash
# Create backup
mongodump --db=rezvo --out=/var/backups/mongodb/$(date +%Y%m%d)

# Restore from backup
mongorestore --db=rezvo /var/backups/mongodb/20260220/rezvo
```

### Database Indexes (For Performance)
```bash
mongosh
use rezvo

// Create indexes
db.businesses.createIndex({ "slug": 1 })
db.businesses.createIndex({ "location_id": 1, "category": 1 })
db.businesses.createIndex({ "claimed": 1 })
db.businesses.createIndex({ "promoted": 1 })
db.reservations.createIndex({ "business_id": 1, "date": 1 })
db.reservations.createIndex({ "user_id": 1 })
db.reviews.createIndex({ "business_id": 1 })
db.locations.createIndex({ "slug": 1 })
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
sudo journalctl -u rezvo-backend -n 50

# Test manually
cd /var/www/rezvo/backend
sudo -u rezvo venv/bin/python server.py
```

### Frontend shows blank page
```bash
# Check build
cd /var/www/rezvo/frontend
sudo -u rezvo npm run build

# Check Nginx config
sudo nginx -t

# View Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### MongoDB connection error
```bash
# Check MongoDB status
sudo systemctl status mongod

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

## Production Checklist

- [ ] Droplet created (Ubuntu 22.04, London)
- [ ] DNS configured (A records pointing to droplet)
- [ ] Deployment script run successfully
- [ ] .env file configured with all credentials
- [ ] SSL certificate installed (HTTPS working)
- [ ] Backend API responding (health check)
- [ ] Frontend loading correctly
- [ ] Database seeded (optional)
- [ ] MongoDB indexes created
- [ ] Cloudflare configured (optional but recommended)
- [ ] Monitoring set up (uptime, logs)
- [ ] Backup strategy in place

## Security Recommendations

1. **Configure Cloudflare** for DDoS protection and CDN
2. **Enable MongoDB authentication:**
   ```bash
   mongosh
   use admin
   db.createUser({user:"rezvo", pwd:"strongpassword", roles:["readWrite"]})
   ```
   Then update MONGODB_URL in .env

3. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Monitor logs regularly** for suspicious activity

5. **Set up automated backups** to DigitalOcean Spaces or S3

## Support

- **GitHub Repo:** https://github.com/Ambassadorbtc/Rezvo
- **Documentation:** `/docs` folder in repository
- **API Docs:** https://api.rezvo.co.uk/docs (once deployed)

---

**Status:** 🚀 Ready to Deploy!
