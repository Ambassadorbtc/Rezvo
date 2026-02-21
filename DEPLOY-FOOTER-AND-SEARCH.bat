@echo off
REM Rezvo Multi-Vertical Search + Footer Deployment
REM Run this file to deploy all changes to production

echo ============================================================
echo Rezvo Multi-Vertical Search Bar + Global Footer Deployment
echo ============================================================
echo.

cd /d "c:\Users\HP Elitebook\Desktop\Cursor\Rezvo"

echo [1/6] Checking Git status...
git status
echo.

echo [2/6] Staging all changes...
git add -A
echo.

echo [3/6] Committing changes...
git commit -m "Add multi-vertical search bar with AI voice search and global footer

FRONTEND ADDITIONS:
- Multi-vertical SearchBar: 5 tabs (restaurants, salons, barbers, spas, more)
- VoiceSearch component with Web Speech API integration (4 states)
- RezvoFooter component with business owner CTA and main footer
- Custom dropdowns with branded styling
- Breathing CTA button with vertical-specific text
- Rotating hint text per vertical
- Nuclear CSS font override

BACKEND ADDITIONS:
- /api/voice-search/parse endpoint with Claude Haiku 4.5
- Voice transcript parsing with structured JSON output

PAGES UPDATED:
- DirectoryLanding: New SearchBar + RezvoFooter
- SearchPage: Vertical filtering + RezvoFooter
- ListingPage: RezvoFooter added
- LoginPage: RezvoFooter added
- SignupPage: RezvoFooter added
- FaqsPage: RezvoFooter added

All pages now have consistent navigation and footer."
echo.

echo [4/6] Pushing to GitHub...
git push origin main
echo.

echo [5/6] Deploying to production server...
ssh -i "C:\Users\HP Elitebook\.ssh\rezvo_rsa" root@178.128.33.73 "cd /opt/rezvo && git pull origin main && cd backend && pip install anthropic && cd ../frontend && npm run build && cd .. && sudo systemctl restart rezvo-backend && sudo systemctl reload nginx && echo 'Deployment complete!'"
echo.

echo [6/6] Testing deployment...
curl -s https://rezvo.co.uk/ | head -c 200
echo.
echo.

echo ============================================================
echo DEPLOYMENT COMPLETE!
echo ============================================================
echo.
echo Test at: https://rezvo.co.uk/
echo.
echo IMPORTANT: Add ANTHROPIC_API_KEY to backend/.env on server:
echo   ssh -i "C:\Users\HP Elitebook\.ssh\rezvo_rsa" root@178.128.33.73
echo   nano /opt/rezvo/backend/.env
echo   Add line: ANTHROPIC_API_KEY=sk-ant-your-key-here
echo.
pause
