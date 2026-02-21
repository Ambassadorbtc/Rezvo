#!/bin/bash
#
# Rezvo - Verify Deployment and Configure SSL
# Run this script on your LOCAL machine (not on the server)
#

set -e

SERVER_IP="178.128.33.73"
DOMAIN="rezvo.co.uk"

echo "=========================================="
echo "REZVO - DEPLOYMENT VERIFICATION"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check if server is accessible
echo -e "${YELLOW}[1/6] Checking server accessibility...${NC}"
if curl -s --connect-timeout 5 http://$SERVER_IP > /dev/null; then
    echo -e "${GREEN}✓ Server is accessible at http://$SERVER_IP${NC}"
else
    echo -e "${RED}✗ Cannot reach server${NC}"
    exit 1
fi

# Step 2: Check DNS propagation
echo ""
echo -e "${YELLOW}[2/6] Checking DNS propagation...${NC}"

DNS_RESULT=$(dig +short $DOMAIN @8.8.8.8 | tail -n1)

if [ "$DNS_RESULT" == "$SERVER_IP" ] || [[ "$DNS_RESULT" == *"cloudflare"* ]]; then
    echo -e "${GREEN}✓ DNS is configured correctly${NC}"
    echo "  $DOMAIN → $DNS_RESULT"
    DNS_READY=true
else
    echo -e "${YELLOW}⚠ DNS not propagated yet${NC}"
    echo "  Current: $DNS_RESULT"
    echo "  Expected: $SERVER_IP"
    echo "  Wait 5-10 minutes and run this script again"
    DNS_READY=false
fi

# Step 3: Check www subdomain
echo ""
echo -e "${YELLOW}[3/6] Checking www subdomain...${NC}"
WWW_RESULT=$(dig +short www.$DOMAIN @8.8.8.8 | tail -n1)
if [ -n "$WWW_RESULT" ]; then
    echo -e "${GREEN}✓ www.$DOMAIN is configured${NC}"
else
    echo -e "${YELLOW}⚠ www.$DOMAIN not yet propagated${NC}"
fi

# Step 4: Check API subdomain
echo ""
echo -e "${YELLOW}[4/6] Checking API subdomain...${NC}"
API_RESULT=$(dig +short api.$DOMAIN @8.8.8.8 | tail -n1)
if [ -n "$API_RESULT" ]; then
    echo -e "${GREEN}✓ api.$DOMAIN is configured${NC}"
else
    echo -e "${YELLOW}⚠ api.$DOMAIN not yet propagated${NC}"
fi

# Step 5: Check backend service
echo ""
echo -e "${YELLOW}[5/6] Checking backend service...${NC}"
HEALTH_CHECK=$(curl -s http://$SERVER_IP:8000/health 2>/dev/null || echo "")
if [[ "$HEALTH_CHECK" == *"healthy"* ]] || [[ "$HEALTH_CHECK" == *"status"* ]]; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${YELLOW}⚠ Backend may not be fully started yet${NC}"
fi

# Step 6: SSH and configure SSL
echo ""
echo -e "${YELLOW}[6/6] SSL Certificate Setup${NC}"

if [ "$DNS_READY" = true ]; then
    echo -e "${GREEN}DNS is ready! You can now get SSL certificate.${NC}"
    echo ""
    echo "Run these commands:"
    echo -e "${YELLOW}ssh root@$SERVER_IP${NC}"
    echo ""
    echo "Then on the server:"
    echo -e "${YELLOW}certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN${NC}"
    echo ""
    echo "After SSL is configured:"
    echo -e "${YELLOW}systemctl restart rezvo-backend nginx${NC}"
    echo ""
    echo -e "${GREEN}Then access your site at:${NC}"
    echo "  Frontend: https://$DOMAIN"
    echo "  API: https://api.$DOMAIN"
    echo "  API Docs: https://api.$DOMAIN/docs"
else
    echo -e "${YELLOW}Wait for DNS propagation before getting SSL certificate${NC}"
    echo "Run this script again in 5-10 minutes"
fi

echo ""
echo "=========================================="
echo "VERIFICATION COMPLETE"
echo "=========================================="
echo ""

# Test raw IP access
echo "Testing raw IP access..."
echo -e "${YELLOW}Try this in your browser: http://$SERVER_IP${NC}"
echo ""
