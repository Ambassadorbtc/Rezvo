# Rezvo Deployment Guide

This guide covers deploying Rezvo to a DigitalOcean droplet in the London datacenter.

## Server Setup

### 1. Create DigitalOcean Droplet

- **Image:** Ubuntu 22.04 LTS
- **Size:** Basic (2 GB RAM / 2 vCPUs minimum for production)
- **Datacenter:** London (LON1)
- **Add SSH key** for secure access

### 2. Initial Server Configuration

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser rezvo
usermod -aG sudo rezvo

# Set up firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Switch to rezvo user
su - rezvo
```

### 3. Install Dependencies

```bash
# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
```

### 4. Clone Repository

```bash
cd /var/www
sudo git clone <your-repo-url> rezvo
sudo chown -R rezvo:rezvo rezvo
cd rezvo
```

### 5. Backend Setup

```bash
cd /var/www/rezvo/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
nano .env  # Edit with your production values
```

### 6. Frontend Setup

```bash
cd /var/www/rezvo/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 7. Configure Nginx

```bash
# Copy nginx config
sudo cp /var/www/rezvo/nginx.conf /etc/nginx/sites-available/rezvo

# Enable site
sudo ln -s /etc/nginx/sites-available/rezvo /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 8. Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk -d api.rezvo.co.uk

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

### 9. Create Systemd Service for Backend

```bash
# Create service file
sudo nano /etc/systemd/system/rezvo-backend.service
```

Add the following content:

```ini
[Unit]
Description=Rezvo Backend API
After=network.target

[Service]
Type=simple
User=rezvo
WorkingDirectory=/var/www/rezvo/backend
Environment="PATH=/var/www/rezvo/backend/venv/bin"
ExecStart=/var/www/rezvo/backend/venv/bin/python server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable rezvo-backend
sudo systemctl start rezvo-backend

# Check status
sudo systemctl status rezvo-backend
```

### 10. Configure DNS

Point your domain to the server:

- **A Record:** `rezvo.co.uk` → Server IP
- **A Record:** `www.rezvo.co.uk` → Server IP
- **A Record:** `api.rezvo.co.uk` → Server IP

### 11. Seed Database

```bash
cd /var/www/rezvo
source backend/venv/bin/activate
python scripts/rezvo_seed_uk.py
```

## Monitoring & Maintenance

### View Logs

```bash
# Backend logs
sudo journalctl -u rezvo-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Update Application

```bash
cd /var/www/rezvo

# Pull latest code
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart rezvo-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Restart Nginx
sudo systemctl restart nginx
```

### Backup Database

```bash
# Create backup
mongodump --db=rezvo --out=/var/backups/mongodb/$(date +%Y%m%d)

# Restore from backup
mongorestore --db=rezvo /var/backups/mongodb/20260220/rezvo
```

## Security Checklist

- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Firewall configured (UFW)
- [ ] SSL/TLS certificates installed
- [ ] MongoDB secured (authentication enabled)
- [ ] Environment variables secured
- [ ] Regular security updates scheduled
- [ ] Backup strategy in place

## Cloudflare Setup

1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Enable:
   - SSL/TLS: Full (strict)
   - Always Use HTTPS
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - Polish (WebP image optimization)
4. Configure caching rules for static assets

## Performance Optimization

### Enable gzip in Nginx

Already configured in `nginx.conf`

### Database Indexing

```javascript
// Connect to MongoDB
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

# Check Python environment
cd /var/www/rezvo/backend
source venv/bin/activate
python server.py  # Run manually to see errors
```

### Frontend not loading

```bash
# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Rebuild frontend
cd /var/www/rezvo/frontend
npm run build
```

### MongoDB connection issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```
