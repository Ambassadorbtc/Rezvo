# Rezvo App - Product Requirements Document

## Overview
Rezvo is a booking application for UK micro-businesses. Web-first responsive platform + native mobile app (Expo).

## Architecture
- **Backend:** FastAPI + MongoDB (`/app/backend/server.py`)
- **Frontend:** React + Tailwind + Shadcn/UI (`/app/frontend/`)
- **Mobile:** React Native / Expo (`/app/mobile/rezvo-mobile/`)

## What's Been Implemented
- Full auth flow (signup, login, Google OAuth, forgot password)
- All dashboard pages with colorful mobile-inspired design + animations
- Public booking page with QR code sharing
- Mobile app with feature parity
- Email action links (cancel/reschedule bookings)
- 5 Landing page test versions
- **Complete Free Business Suite (21 tools) at `/tools`**

## Free Business Suite — All 21 Tools Live
Hub: `/tools`

### Client-Side Tools (no backend needed):
1. QR Code Generator — `/tools/qr-code-generator`
2. Service Menu Generator — `/tools/service-menu-generator`
3. No-Show Reminder Templates — `/tools/no-show-reminder`
4. Pricing Calculator — `/tools/pricing-calculator`
5. Keyword Density Analyzer — `/tools/keyword-density`
6. Client Intake Questions — `/tools/client-intake`
7. Review Reply Generator — `/tools/review-reply`
8. Social Post Ideas — `/tools/social-post-ideas`
9. Opening Hours Gap Finder — `/tools/opening-hours-gap`
10. Instant Booking Link Maker — `/tools/booking-link-maker`
11. Anything to Markdown — `/tools/markdown-converter`

### Server-Side SEO Tools (backend endpoints):
12. Domain SEO Checker — `/tools/domain-seo-checker`
13. Meta Tag Checker — `/tools/meta-tag-checker`
14. Robots.txt Checker — `/tools/robots-txt-checker`
15. Website URL Extractor — `/tools/url-extractor`
16. XML Sitemap Generator — `/tools/xml-sitemap-generator`
17. Sitemap URL Extractor — `/tools/sitemap-extractor`
18. Sitemap Validator — `/tools/sitemap-validator`
19. Sitemap Finder — `/tools/sitemap-finder`
20. Broken Link Checker — `/tools/broken-link-checker`
21. Page Speed Tester — `/tools/page-speed`

### Backend API Endpoints Added:
- `POST /api/tools/fetch-url`
- `POST /api/tools/extract-links`
- `POST /api/tools/meta-tags`
- `POST /api/tools/robots-txt`
- `POST /api/tools/sitemap-parse`
- `POST /api/tools/sitemap-find`
- `POST /api/tools/check-links`

## Pricing Plans
- **Starter (Free):** 50 bookings/mo, 50 links, 400 reminders, 1 team member
- **Professional (£8.99/mo):** Unlimited everything, deposits, AI, priority support
- **Business (£25/mo - Coming Soon):** Multi-location, Google Calendar, Dojo payments

## Pending / Backlog
- Replace current landing page with chosen test version (test-4 or test-5)
- Add "Free Tools" link to main app footer/nav
- Plans management in admin panel
- Google Calendar Sync (needs user OAuth credentials)
- Dojo Payment Integration
- Rate limiting on tools (10/day/IP/tool)

## Test Accounts
- `demo@rezvo.com` / `demo123`
