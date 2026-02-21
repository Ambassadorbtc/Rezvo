# Manual Rezvo Deployment Commands

Copy and paste these into your SSH session: `ssh root@178.128.33.73`

## Full Deployment (Copy All Commands)

```bash
# 1. Install Node.js repository
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# 2. Install MongoDB repository
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 3. Install all packages
apt update
apt install -y git python3.11 python3.11-venv python3-pip nodejs mongodb-org nginx

# 4. Start MongoDB
systemctl start mongod
systemctl enable mongod

# 5. Clone Rezvo
cd /var/www
git clone https://github.com/Ambassadorbtc/Rezvo.git rezvo
cd rezvo

# 6. Setup Backend
cd backend
python3.11 -m venv venv
venv/bin/pip install -r requirements.txt

# 7. Create .env (IMPORTANT - edit after copying)
cat > .env << 'EOF'
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=rezvo
JWT_SECRET_KEY=change-this-to-random-32-char-string
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=10080
GOOGLE_PLACES_API_KEY=your-key-here
GOOGLE_MAPS_API_KEY=your-key-here
GOOGLE_GEOCODING_API_KEY=your-key-here
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-key
FRONTEND_URL=https://rezvo.co.uk
BACKEND_URL=https://api.rezvo.co.uk
ENVIRONMENT=production
EOF

# 8. Setup Frontend
cd ../frontend
npm install
npm run build

# 9. Configure Nginx
cp ../nginx.conf /etc/nginx/sites-available/rezvo
ln -sf /etc/nginx/sites-available/rezvo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 10. Create systemd service
cat > /etc/systemd/system/rezvo-backend.service << 'EOF'
[Unit]
Description=Rezvo Backend API
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/rezvo/backend
Environment="PATH=/var/www/rezvo/backend/venv/bin"
ExecStart=/var/www/rezvo/backend/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 11. Start everything
systemctl daemon-reload
systemctl enable rezvo-backend
systemctl start rezvo-backend
systemctl enable nginx
systemctl start nginx

# 12. Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 13. Check status
echo "==================================="
echo "CHECKING STATUS..."
echo "==================================="
systemctl status rezvo-backend --no-pager | head -20
echo ""
systemctl status nginx --no-pager | head -20
echo ""
curl http://localhost:8000/health
echo ""
echo "==================================="
echo "DEPLOYMENT COMPLETE!"
echo "==================================="
```

## Quick Commands Reference

### Check Status
```bash
systemctl status rezvo-backend
systemctl status nginx
systemctl status mongod
```

### View Logs
```bash
journalctl -u rezvo-backend -f
tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
systemctl restart rezvo-backend
systemctl restart nginx
```

### Test Locally
```bash
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

## After Manual Deployment

1. **Edit .env file** with your actual API keys:
```bash
nano /var/www/rezvo/backend/.env
systemctl restart rezvo-backend
```

2. **Check DNS propagation:**
```bash
dig rezvo.co.uk +short
```

3. **Get SSL certificate** (once DNS works):
```bash
certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk -d api.rezvo.co.uk
```

4. **Access your site:**
- Frontend: https://rezvo.co.uk
- API: https://api.rezvo.co.uk
- API Docs: https://api.rezvo.co.uk/docs

---

**Run these commands in your SSH session and paste the output here!**
