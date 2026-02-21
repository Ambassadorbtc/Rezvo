#!/bin/bash
# Rezvo Multi-Vertical Search Bar — Quick Deploy Script
# Run this on the production server after pushing to GitHub

echo "🚀 Rezvo Multi-Vertical Search Bar Deployment"
echo "============================================================"

cd /opt/rezvo || exit 1

echo ""
echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "📦 Installing Python dependencies..."
cd backend
pip install anthropic
cd ..

echo ""
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo ""
echo "🔄 Restarting backend service..."
sudo systemctl restart rezvo-backend

echo ""
echo "♻️ Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "🧪 Testing deployment..."
curl -s http://localhost/ | head -c 100
echo ""

echo ""
echo "✅ Deployment Complete!"
echo "🌐 Live at: https://rezvo.co.uk/"
echo ""
echo "⚠️  IMPORTANT: Add ANTHROPIC_API_KEY to backend/.env"
echo "    nano backend/.env"
echo "    Add line: ANTHROPIC_API_KEY=sk-ant-your-key-here"
echo ""
echo "📊 Check logs:"
echo "    Backend: sudo journalctl -u rezvo-backend -f"
echo "    Nginx:   sudo tail -f /var/log/nginx/error.log"
