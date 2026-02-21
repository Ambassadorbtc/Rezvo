# Rezvo Multi-Vertical Search Bar — Quick Deploy Script
# Run this in PowerShell when system is responsive

Write-Host "🚀 Rezvo Multi-Vertical Search Bar Deployment" -ForegroundColor Cyan
Write-Host "=" * 60

# Navigate to project
Set-Location "c:\Users\HP Elitebook\Desktop\Cursor\Rezvo"

# Check status
Write-Host "`n📊 Git Status:" -ForegroundColor Yellow
git status

# Stage all changes
Write-Host "`n➕ Staging changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "`n💾 Committing..." -ForegroundColor Yellow
git commit -m "Add multi-vertical search bar with AI voice search

- Rebuilt SearchBar with 5 vertical tabs (restaurants, salons, barbers, spas, more)
- Added VoiceSearch component with Web Speech API integration
- Built /api/voice-search/parse backend endpoint with Claude Haiku 4.5
- Adaptive Filter 3 changes based on selected vertical
- Custom dropdowns with branded styling and animations
- Breathing CTA button with vertical-specific text
- Rotating hint text per vertical
- Nuclear CSS font override for brand enforcement"

# Push to GitHub
Write-Host "`n⬆️ Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "`n✅ Pushed to GitHub!" -ForegroundColor Green

# Deploy to production server
Write-Host "`n🌐 Deploying to production server..." -ForegroundColor Cyan

$deployScript = @"
cd /opt/rezvo &&
git pull origin main &&
echo '📦 Installing backend dependencies...' &&
cd backend && pip install anthropic && cd .. &&
echo '🔨 Building frontend...' &&
cd frontend && npm run build && cd .. &&
echo '🔄 Restarting services...' &&
sudo systemctl restart rezvo-backend &&
sudo systemctl reload nginx &&
echo '✅ Deployment complete!' &&
curl -s http://localhost/ | head -c 100
"@

ssh -i "C:\Users\HP Elitebook\.ssh\rezvo_rsa" root@178.128.33.73 $deployScript

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "Test at: https://rezvo.co.uk/" -ForegroundColor Cyan
Write-Host "`n⚠️ Don't forget to add ANTHROPIC_API_KEY to backend/.env on server" -ForegroundColor Yellow
