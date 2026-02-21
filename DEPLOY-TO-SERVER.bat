@echo off
echo ========================================
echo REZVO - DEPLOY TO SERVER
echo ========================================
echo.
echo This will SSH into the server and deploy the latest code.
echo You will be prompted for your SSH passphrase.
echo.
pause

echo.
echo Connecting to server...
ssh root@146.190.111.28 "cd /opt/rezvo && echo 'Connected to server' && git pull origin main && echo 'Code pulled' && cd frontend && npm run build && echo 'Frontend built' && sudo systemctl restart rezvo-backend && echo 'Backend restarted' && sudo systemctl reload nginx && echo 'Nginx reloaded' && echo 'DEPLOYMENT COMPLETE'"

echo.
echo ========================================
echo DEPLOYMENT FINISHED
echo ========================================
echo.
echo Test the site at: https://rezvo.co.uk
echo.
pause
