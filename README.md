# Rezvo Directory — rezvo.co.uk

Consumer-facing directory for discovering and booking local businesses across the UK.

## What's here
- **Frontend** — React + Tailwind SPA (directory, search, listings, booking flow)
- **Nginx config** — serves the built frontend

## What's NOT here
- Backend API → lives in [Rezvo.app](https://github.com/Ambassadorbtc/Rezvo.app)
- Owner portal/dashboard → lives in [Rezvo.app](https://github.com/Ambassadorbtc/Rezvo.app)
- Marketing pages → lives in [Rezvo.app](https://github.com/Ambassadorbtc/Rezvo.app)

## Deploy
Push to `main` → GitHub Actions builds + deploys to DigitalOcean.

## Local dev
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## Stack
- React 18 + React Router
- Tailwind CSS
- Vite
- Brand: Forest #1B4332 | Cream #FEFBF4 | Bricolage Grotesque + Figtree
