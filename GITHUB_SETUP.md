# Push Rezvo to GitHub

## Quick Setup

### Option 1: Using GitHub CLI (Fastest)

```bash
# Install gh CLI if you haven't: https://cli.github.com/

# Authenticate
gh auth login

# Create repo and push
gh repo create rezvo --public --source=. --remote=origin --push
```

### Option 2: Manual Setup

1. **Create GitHub Repository**
   - Go to https://github.com/new
   - Repository name: `rezvo`
   - Description: "Multi-vertical booking platform for UK restaurants, barbers, salons, and spas"
   - Choose Public or Private
   - **Don't** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push to GitHub**
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rezvo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## What's Being Pushed

✅ **79 files committed:**
- Complete backend (FastAPI + 14 route modules)
- Complete frontend (React + Vite + Tailwind)
- All documentation (README, QUICKSTART, API docs, Deployment guide)
- Configuration files (Docker, Nginx, .env examples)
- Database seeder script

✅ **8,390 lines of code**

## After Pushing

Your GitHub repo will be production-ready with:
- Complete codebase
- Professional README with setup instructions
- Deployment documentation
- API documentation
- Quick start guide

## Next Step: Deploy to DigitalOcean

Once pushed to GitHub, you can:

1. SSH into your DigitalOcean droplet
2. Clone the repo: `git clone https://github.com/YOUR_USERNAME/rezvo.git`
3. Follow `docs/DEPLOYMENT.md` guide
4. Go live! 🚀
