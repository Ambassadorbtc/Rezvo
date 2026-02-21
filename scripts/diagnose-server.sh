#!/bin/bash
#
# Rezvo - Server Diagnostics
# Run this ON THE SERVER to collect status information
#

echo "=========================================="
echo "REZVO SERVER DIAGNOSTICS"
echo "=========================================="
echo ""

echo "SERVER INFO:"
echo "============"
hostname
uptime
echo ""

echo "NGINX STATUS:"
echo "============="
systemctl status nginx --no-pager -l
echo ""

echo "NGINX TEST:"
echo "==========="
nginx -t
echo ""

echo "REZVO BACKEND STATUS:"
echo "====================="
systemctl status rezvo-backend --no-pager -l
echo ""

echo "BACKEND LOGS (last 30 lines):"
echo "=============================="
journalctl -u rezvo-backend -n 30 --no-pager
echo ""

echo "MONGODB STATUS:"
echo "==============="
systemctl status mongod --no-pager
echo ""

echo "LISTENING PORTS:"
echo "================"
netstat -tlnp | grep -E ':(80|443|8000|27017)'
echo ""

echo "DISK SPACE:"
echo "==========="
df -h /
echo ""

echo "MEMORY:"
echo "======="
free -h
echo ""

echo "DEPLOYMENT LOG (last 50 lines):"
echo "================================"
if [ -f /var/log/rezvo-deploy.log ]; then
    tail -n 50 /var/log/rezvo-deploy.log
else
    echo "Deployment log not found"
fi
echo ""

echo "ENV FILE CHECK:"
echo "==============="
if [ -f /var/www/rezvo/backend/.env ]; then
    echo ".env file exists"
    echo "Lines in .env: $(wc -l < /var/www/rezvo/backend/.env)"
else
    echo ".env file NOT FOUND - this is likely the problem!"
fi
echo ""

echo "PYTHON VERSION:"
echo "==============="
/var/www/rezvo/backend/venv/bin/python --version || echo "Python venv not found"
echo ""

echo "NGINX ERROR LOG (last 20 lines):"
echo "================================="
tail -n 20 /var/log/nginx/error.log
echo ""

echo "=========================================="
echo "DIAGNOSTICS COMPLETE"
echo "=========================================="
