#!/bin/bash
# Fix HTTPS 503 and Add Anthropic API Key
# Run this script on the VPS: ssh root@146.190.111.28
# Then: bash /opt/rezvo/FIX-HTTPS-AND-API-KEY.sh

echo "=== REZVO DEPLOYMENT BLOCKER FIXES ==="
echo ""

# ============================================
# BLOCKER 1: DIAGNOSE HTTPS 503
# ============================================
echo "BLOCKER 1: Diagnosing HTTPS 503 issue..."
echo ""

echo "Step 1: Check SSL certificates..."
sudo certbot certificates
echo ""

echo "Step 2: List nginx site configs..."
ls -la /etc/nginx/sites-enabled/
echo ""

echo "Step 3: Check nginx config for rezvo..."
if [ -f /etc/nginx/sites-enabled/rezvo ]; then
    echo "Found /etc/nginx/sites-enabled/rezvo"
    sudo cat /etc/nginx/sites-enabled/rezvo
elif [ -f /etc/nginx/sites-enabled/rezvo.conf ]; then
    echo "Found /etc/nginx/sites-enabled/rezvo.conf"
    sudo cat /etc/nginx/sites-enabled/rezvo.conf
elif [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Found /etc/nginx/sites-enabled/default"
    sudo cat /etc/nginx/sites-enabled/default
else
    echo "ERROR: No nginx config found!"
fi
echo ""

echo "Step 4: Check backend service status..."
sudo systemctl status rezvo-backend --no-pager
echo ""

echo "Step 5: Check if backend is listening on port 8000..."
ss -tlnp | grep 8000
echo ""

echo "Step 6: Check nginx error logs..."
sudo tail -30 /var/log/nginx/error.log
echo ""

echo "Step 7: Test nginx config syntax..."
sudo nginx -t
echo ""

# ============================================
# COMMON FIXES FOR HTTPS 503
# ============================================
echo ""
echo "=== COMMON FIXES ==="
echo ""
echo "If SSL cert doesn't exist, run:"
echo "  sudo certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk"
echo ""
echo "If cert exists but nginx config is wrong:"
echo "  1. Edit config: sudo nano /etc/nginx/sites-enabled/rezvo"
echo "  2. Make sure listen 443 ssl block exists with:"
echo "     - ssl_certificate /etc/letsencrypt/live/rezvo.co.uk/fullchain.pem;"
echo "     - ssl_certificate_key /etc/letsencrypt/live/rezvo.co.uk/privkey.pem;"
echo "     - server_name rezvo.co.uk www.rezvo.co.uk;"
echo "  3. Test and reload: sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "If backend is not running:"
echo "  sudo systemctl restart rezvo-backend"
echo "  sudo systemctl status rezvo-backend"
echo ""

# ============================================
# BLOCKER 2: ADD ANTHROPIC API KEY
# ============================================
echo ""
echo "BLOCKER 2: Adding Anthropic API Key..."
echo ""

echo "Current backend .env file:"
if [ -f /opt/rezvo/backend/.env ]; then
    echo "File exists at /opt/rezvo/backend/.env"
    echo "Current ANTHROPIC_API_KEY setting:"
    grep "ANTHROPIC_API_KEY" /opt/rezvo/backend/.env || echo "  (not set)"
else
    echo "ERROR: /opt/rezvo/backend/.env not found!"
fi
echo ""

echo "To add the API key:"
echo "  1. Edit: sudo nano /opt/rezvo/backend/.env"
echo "  2. Add line: ANTHROPIC_API_KEY=sk-ant-YOUR-KEY-HERE"
echo "  3. Save (Ctrl+O, Enter, Ctrl+X)"
echo "  4. Restart: sudo systemctl restart rezvo-backend"
echo "  5. Verify: sudo systemctl status rezvo-backend"
echo ""

# ============================================
# VERIFICATION CHECKLIST
# ============================================
echo ""
echo "=== VERIFICATION CHECKLIST ==="
echo ""
echo "After fixes, test these URLs:"
echo "  1. https://rezvo.co.uk (should load with SSL padlock)"
echo "  2. https://rezvo.co.uk/api/docs (should load FastAPI Swagger UI)"
echo "  3. http://rezvo.co.uk (should redirect to HTTPS or work)"
echo "  4. Voice search on homepage (should work with API key)"
echo ""
echo "=== END OF DIAGNOSTICS ==="
