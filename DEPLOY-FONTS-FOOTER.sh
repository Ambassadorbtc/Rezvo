#!/bin/bash
# Deploy font and footer fixes to production server
# Run this on your LOCAL machine (PowerShell or Git Bash)

echo "=== REZVO FONT & FOOTER FIX DEPLOYMENT ==="
echo ""
echo "Step 1: Pull latest changes on server..."
ssh root@146.190.111.28 << 'ENDSSH'
cd /opt/rezvo
git pull origin main
ENDSSH

echo ""
echo "Step 2: Rebuild frontend..."
ssh root@146.190.111.28 << 'ENDSSH'
cd /opt/rezvo/frontend
npm run build
ENDSSH

echo ""
echo "Step 3: Restart backend service..."
ssh root@146.190.111.28 << 'ENDSSH'
sudo systemctl restart rezvo-backend
sudo systemctl status rezvo-backend --no-pager
ENDSSH

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo ""
echo "✅ Fonts fixed: All headings now use Figtree 800"
echo "✅ Footer fixed: Single CTA, watermark at bottom"
echo ""
echo "Test at: http://rezvo.co.uk"
echo ""
