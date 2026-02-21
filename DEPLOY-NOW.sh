#!/bin/bash
# Complete deployment script - run on server
set -e

echo "=== REZVO DEPLOYMENT STARTING ==="
echo ""

# Pull latest code
echo "Step 1: Pulling latest code..."
cd /opt/rezvo
git pull origin main
echo "✓ Code updated"
echo ""

# Build frontend
echo "Step 2: Building frontend..."
cd /opt/rezvo/frontend
npm run build
echo "✓ Frontend built"
echo ""

# Restart backend
echo "Step 3: Restarting backend..."
sudo systemctl restart rezvo-backend
sleep 2
sudo systemctl status rezvo-backend --no-pager | head -10
echo "✓ Backend restarted"
echo ""

# Reload nginx
echo "Step 4: Reloading nginx..."
sudo nginx -t
sudo systemctl reload nginx
echo "✓ Nginx reloaded"
echo ""

echo "=== DEPLOYMENT COMPLETE ==="
echo ""
echo "Test the site:"
echo "  http://rezvo.co.uk"
echo "  https://rezvo.co.uk"
echo ""
