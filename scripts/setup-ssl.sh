#!/bin/bash
#
# Rezvo - SSL Certificate Setup
# Run this script ON THE SERVER (after DNS is propagated)
#

set -e

DOMAIN="rezvo.co.uk"

echo "=========================================="
echo "REZVO - SSL CERTIFICATE SETUP"
echo "=========================================="
echo ""

# Check if we're root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root: sudo bash setup-ssl.sh"
    exit 1
fi

# Check DNS
echo "[1/5] Checking DNS..."
for subdomain in "" "www." "api."; do
    dns_check=$(dig +short ${subdomain}${DOMAIN} | tail -n1)
    if [ -n "$dns_check" ]; then
        echo "✓ ${subdomain}${DOMAIN} → $dns_check"
    else
        echo "✗ ${subdomain}${DOMAIN} not resolving"
        echo "Wait for DNS propagation and try again"
        exit 1
    fi
done

# Check if certbot is installed
echo ""
echo "[2/5] Checking certbot..."
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi
echo "✓ Certbot installed"

# Check Nginx
echo ""
echo "[3/5] Checking Nginx..."
if ! systemctl is-active --quiet nginx; then
    echo "Starting Nginx..."
    systemctl start nginx
fi
echo "✓ Nginx running"

# Get SSL certificate
echo ""
echo "[4/5] Getting SSL certificate..."
echo "This will:"
echo "  - Verify domain ownership"
echo "  - Issue SSL certificate"
echo "  - Configure Nginx automatically"
echo ""

certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --redirect \
    --email admin@$DOMAIN || {
        echo ""
        echo "Certbot failed. Run manually:"
        echo "certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN"
        exit 1
    }

# Restart services
echo ""
echo "[5/5] Restarting services..."
systemctl restart rezvo-backend
systemctl restart nginx

echo ""
echo "=========================================="
echo "✓ SSL CERTIFICATE CONFIGURED!"
echo "=========================================="
echo ""
echo "Your site is now available at:"
echo "  Frontend: https://$DOMAIN"
echo "  API: https://api.$DOMAIN"
echo "  API Docs: https://api.$DOMAIN/docs"
echo ""
echo "Auto-renewal is configured:"
echo "  Certificate will auto-renew before expiry"
echo "  Test renewal: certbot renew --dry-run"
echo ""
