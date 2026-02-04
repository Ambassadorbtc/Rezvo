# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP called `rezvo.app` for UK micro-businesses. The application includes a web-first responsive application for businesses and a native mobile app for both clients and businesses. The design aesthetic is "super modern," inspired by UK challenger banks Monzo and Starling.

## User Personas
1. **Business Owner** - UK micro-business (hairdresser, nail tech, barber, PT, etc.) who needs simple booking management
2. **Client** - End customer who wants to book appointments easily
3. **Founder/Admin** - Platform administrator who monitors the system

## Core Requirements
- **Monetization:** £4.99/month subscription via Stripe (PLANNED)
- **Core Feature:** Allow businesses to generate shareable booking links
- **Platforms:** Web application + React Native mobile app
- **Design:** Light theme with teal (#00BFA5) accents, Space Grotesk & Plus Jakarta Sans fonts

## What's Been Implemented

### Web Application (React)
- [x] Landing page with modern design and CTA
- [x] User authentication (JWT-based)
- [x] Business dashboard with stats
- [x] Calendar view with team member columns (Fresha-style)
- [x] **Team Management Page** (REDESIGNED - Premium table with inline editing)
  - Premium table layout with Name, Email, Role, Status, Actions columns
  - Round profile avatars with colored backgrounds
  - Inline editing (expands below row - NOT modal)
  - Profile image upload with color picker
  - Service assignment per team member
  - "Show on booking page" visibility toggle
- [x] Services management (CRUD)
- [x] Bookings management with status updates
- [x] Analytics dashboard with charts (Recharts)
- [x] Settings page with business details
- [x] Shareable booking links with QR codes
- [x] Public booking page for customers
- [x] Legal pages: Privacy, Terms, Cookie Policy
- [x] Cookie consent popup (GDPR compliant)
- [x] Onboarding wizard UI (4 steps)
- [x] Founder Admin Panel with TailAdmin-style design
- [ ] Global search (DISABLED - babel plugin conflict)

### Mobile Application (React Native/Expo)
- [x] Welcome screen with onboarding slides
- [x] Login/Signup screens with user type toggle
- [x] Complete Auth Flow (Forgot Password, Verify Code, Reset Password)
- [x] Client Flow (Home, Search, Bookings, Profile, Business Detail, Booking Flow)
- [x] Business Flow (Dashboard, Calendar, Bookings, Services, Team, Settings)
- [x] Settings with functional navigation (Help Centre, Contact Support, Terms & Privacy)

### Backend (FastAPI + MongoDB)
- [x] Authentication endpoints (signup, login, me)
- [x] Password Reset Flow
- [x] Business management endpoints
- [x] Services CRUD endpoints
- [x] Team Members CRUD with show_on_booking_page field
- [x] Image Upload Endpoint - POST /api/upload/avatar
- [x] Public Team Endpoint - GET /api/public/business/{id}/team (filtered by visibility)
- [x] Enhanced Calendar API with team view
- [x] Bookings endpoints with team member assignment
- [x] Public booking endpoints
- [x] AI-powered suggestions (OpenAI GPT-4o-mini)
- [x] Email notifications (Resend)
- [x] Notifications system
- [x] Products CRUD
- [x] Admin analytics endpoints

### Integrations
- [x] OpenAI GPT-4o-mini (via Emergent LLM Key)
- [x] Resend for email notifications
- [x] React Native / Expo for mobile
- [x] Recharts for analytics visualizations

## Test Credentials
- **Email:** testuser@example.com
- **Password:** password123

## Database Schema
- **users:** id, email, passwordHash, role, createdAt, business_id
- **businesses:** id, ownerId, name, logoUrl, services, availability
- **services:** id, businessId, name, pricePence, durationMin, color
- **bookings:** id, serviceId, clientName, datetime, status, team_member_id
- **team_members:** id, business_id, name, email, phone, role, color, avatar_url, service_ids, show_on_booking_page
- **password_resets:** email, code, expires, used, reset_token
- **notifications:** id, userId, title, message, type, read
- **short_links:** id, short_code, business_id, clicks
- **products:** id, business_id, name, price_pence, stock_quantity

## Application URLs
- **Web Landing:** https://bookrezvo.preview.emergentagent.com
- **Web Dashboard:** https://bookrezvo.preview.emergentagent.com/dashboard
- **Web Team:** https://bookrezvo.preview.emergentagent.com/team
- **Mobile Preview:** https://bookrezvo.preview.emergentagent.com/mobile-preview
- **Admin Panel:** https://bookrezvo.preview.emergentagent.com/admin

## Known Issues
1. **Global Search (DISABLED):** The SearchModal component causes infinite recursion with babel-metadata-plugin. Plugin disabled in craco.config.js.
2. **Mobile App Login Crash:** The Expo app may crash on login - needs investigation of navigation stacks.

## P0 - Next Priority Tasks
1. Wire onboarding wizard to backend (complete business setup flow)
2. Full client-side mobile app functionality (backend wiring)
3. Push notifications (Expo)
4. Team member selection on public booking page

## P1 - Upcoming Tasks
- Stripe subscription integration (£4.99/month)
- Google Calendar sync
- Automated booking reminders (cron/scheduled)
- SMS notifications (Twilio)
- Fix global search feature (needs babel plugin fix)

## P2 - Future/Backlog
- Multi-location business support
- Advanced team scheduling (shift management)
- Customer reviews
- Advanced analytics/reports
- Staff separate logins

## Code Architecture
```
/app/
├── backend/
│   ├── server.py          # FastAPI with all endpoints
│   └── uploads/           # Avatar images storage
├── frontend/
│   ├── craco.config.js    # Babel plugin disabled here
│   └── src/
│       ├── components/    
│       │   ├── AppLayout.jsx      # Main navigation layout
│       │   ├── CookieConsent.jsx
│       │   └── ui/
│       └── pages/         
│           ├── DashboardPage.jsx
│           ├── CalendarPage.jsx
│           ├── TeamPage.jsx       # Premium table, inline editing
│           ├── MobilePreview.jsx
│           └── ...
├── mobile/
│   └── rezvo-mobile/
│       └── src/
│           ├── navigation/AppNavigator.js
│           └── screens/
└── memory/
    └── PRD.md
```

## Last Updated
February 4, 2026 - Session 5:
- Completely redesigned Team page with premium table layout
- Replaced modal editing with inline expansion panel
- Fixed babel-metadata-plugin infinite recursion (disabled plugin)
- Testing agent fixed 3 bugs: empty email validation, undefined service_ids
- All Team page features verified working (100% test pass rate)
