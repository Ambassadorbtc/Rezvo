@echo off
echo ========================================
echo REZVO - DEPLOY TO SERVER
echo ========================================
echo.
echo Server: root@146.190.111.28 (rezvo.co.uk)
echo.
echo You will be prompted for your SSH passphrase.
echo.

ssh -i "C:\Users\HP Elitebook\.ssh\rezvo_rsa" root@146.190.111.28 "cd /opt/rezvo && git pull origin main && cd frontend && npm run build && sudo systemctl restart rezvo-backend && sudo systemctl reload nginx && echo && echo ========== DEPLOYMENT COMPLETE ========== && echo Site live at: https://rezvo.co.uk"

echo.
echo ========================================
echo Done!
echo ========================================
pause
