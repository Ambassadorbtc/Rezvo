#!/bin/bash
#
# Rezvo - DigitalOcean Deployment Script
# Run this on your DigitalOcean droplet (Ubuntu 22.04 LTS, London datacenter)
#

set -e

echo "=========================================="
echo "REZVO DEPLOYMENT - DigitalOcean London"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run as root. Run as your user with sudo access.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Starting deployment...${NC}"
echo ""

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
echo "🐍 Installing Python 3.11..."
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install Node.js 18
echo "📗 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB 7.0
echo "🍃 Installing MongoDB 7.0..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create rezvo user if doesn't exist
if ! id "rezvo" &>/dev/null; then
    echo "👤 Creating rezvo user..."
    sudo adduser --disabled-password --gecos "" rezvo
    sudo usermod -aG sudo rezvo
fi

# Create project directory
echo "📁 Setting up project directory..."
sudo mkdir -p /var/www/rezvo
sudo chown -R rezvo:rezvo /var/www/rezvo

# Clone repository
echo "📥 Cloning Rezvo repository..."
cd /var/www
if [ -d "rezvo/.git" ]; then
    echo "Repository exists, pulling latest changes..."
    cd rezvo
    sudo -u rezvo git pull
else
    sudo -u rezvo git clone https://github.com/Ambassadorbtc/Rezvo.git rezvo
    cd rezvo
fi

# Backend setup
echo "🔧 Setting up backend..."
cd /var/www/rezvo/backend
sudo -u rezvo python3.11 -m venv venv
sudo -u rezvo venv/bin/pip install --upgrade pip
sudo -u rezvo venv/bin/pip install -r requirements.txt

# Frontend setup
echo "⚛️  Setting up frontend..."
cd /var/www/rezvo/frontend
sudo -u rezvo npm install

# Create .env file if it doesn't exist
if [ ! -f "/var/www/rezvo/backend/.env" ]; then
    echo "📝 Creating .env file..."
    sudo -u rezvo cp /var/www/rezvo/.env.example /var/www/rezvo/backend/.env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit /var/www/rezvo/backend/.env with your actual credentials${NC}"
    echo "   Required: MongoDB URL, JWT secret, Google API keys, Stripe keys"
fi

# Build frontend
echo "🏗️  Building frontend..."
cd /var/www/rezvo/frontend
sudo -u rezvo npm run build

# Create systemd service for backend
echo "🚀 Creating systemd service..."
sudo tee /etc/systemd/system/rezvo-backend.service > /dev/null <<EOF
[Unit]
Description=Rezvo Backend API
After=network.target mongod.service

[Service]
Type=simple
User=rezvo
WorkingDirectory=/var/www/rezvo/backend
Environment="PATH=/var/www/rezvo/backend/venv/bin"
ExecStart=/var/www/rezvo/backend/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "🌍 Configuring Nginx..."
sudo cp /var/www/rezvo/nginx.conf /etc/nginx/sites-available/rezvo
sudo ln -sf /etc/nginx/sites-available/rezvo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Start services
echo "▶️  Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable rezvo-backend
sudo systemctl start rezvo-backend
sudo systemctl restart nginx

# Check service status
echo ""
echo "📊 Service Status:"
echo "===================="
sudo systemctl status rezvo-backend --no-pager | head -n 10
echo ""
sudo systemctl status nginx --no-pager | head -n 10

echo ""
echo -e "${GREEN}=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit /var/www/rezvo/backend/.env with your credentials"
echo "2. Configure your domain DNS to point to this server"
echo "3. Get SSL certificate:"
echo "   sudo certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk -d api.rezvo.co.uk"
echo ""
echo "4. Restart backend after editing .env:"
echo "   sudo systemctl restart rezvo-backend"
echo ""
echo "5. Seed database (optional):"
echo "   cd /var/www/rezvo"
echo "   sudo -u rezvo backend/venv/bin/python scripts/rezvo_seed_uk.py"
echo ""
echo "View logs:"
echo "  Backend:  sudo journalctl -u rezvo-backend -f"
echo "  Nginx:    sudo tail -f /var/log/nginx/error.log"
echo ""
echo "Your API will be at: https://api.rezvo.co.uk"
echo "Your frontend will be at: https://rezvo.co.uk"
echo ""
