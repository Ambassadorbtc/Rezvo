# Rezvo.app - Product Requirements Document

## Overview
Rezvo is a £4.99/month booking tool for UK micro-businesses who can't stomach £40+ schedulers like Booksy. Target: mobile hairdressers, food trucks, nail techs, personal trainers, dog groomers, driving instructors.

**Core Promise:** Generate a shareable booking link in 12 seconds.
**App Name:** rezvo.app

---

## User Personas

### Primary Persona: Solo Service Provider
- **Name:** Sarah, 28, Mobile Hairdresser in Manchester
- **Pain Points:** Expensive booking tools (Booksy £40/mo), manual appointment scheduling via WhatsApp, frequent no-shows
- **Goals:** Simple booking system, shareable links for social media, deposit collection to reduce no-shows
- **Tech Savvy:** Uses TikTok/Instagram daily, comfortable with apps

### Secondary Persona: Small Business Owner
- **Name:** James, 35, Personal Trainer in London
- **Pain Points:** Juggling multiple clients, tracking revenue, managing availability
- **Goals:** Professional booking page, analytics dashboard, automated reminders

---

## What's Been Implemented

### Date: 2026-02-04 (Latest Update)

**Design & Fonts:**
- ✅ Updated typography to Monzo/Starling style:
  - Headlines: Space Grotesk (clean, geometric)
  - Body/UI: Plus Jakarta Sans (modern, readable)
- ✅ Teal (#00BFA5) primary color maintained
- ✅ Cream (#FDFBF7) background
- ✅ Pill-shaped buttons throughout

**Session & Auth:**
- ✅ Fixed session persistence bug
- ✅ Renamed localStorage keys from `quickslot_token` to `rezvo_token`
- ✅ Added user data caching in `rezvo_user`
- ✅ Immediate state rehydration prevents auth flash

**Backend (FastAPI + MongoDB):**
- ✅ Complete authentication system (JWT, 14-day expiry, bcrypt)
- ✅ Business CRUD operations
- ✅ Services CRUD with deposits
- ✅ Bookings management
- ✅ Public booking endpoints
- ✅ Shareable link generation
- ✅ Analytics endpoints
- ✅ Share link URL fixed to use rezvo domain

**Web Frontend (React + Tailwind + shadcn/ui):**
- ✅ Landing page with Monzo/Starling design
- ✅ Signup/Login pages with new fonts
- ✅ Dashboard with navigation sidebar
- ✅ Calendar view (week/month toggle)
- ✅ Bookings list with filtering
- ✅ Services management
- ✅ Share Link page with QR code
- ✅ Settings page
- ✅ Analytics page with Recharts
- ✅ Public booking page for clients

**React Native Mobile App (NEW):**
- ✅ Expo project setup at `/app/mobile/rezvo-mobile`
- ✅ Dual-mode architecture (Client & Business views)
- ✅ Shared theme with web app (teal primary)
- ✅ Navigation with bottom tabs

**Mobile Client Screens:**
- ✅ WelcomeScreen - Onboarding carousel
- ✅ LoginScreen / SignupScreen - User type toggle (Client/Business)
- ✅ HomeScreen - Search, promo banner, categories, top rated
- ✅ SearchScreen - Filter chips, business cards
- ✅ BookingsScreen - Upcoming/Past/Cancelled tabs
- ✅ ProfileScreen - Account settings, switch mode
- ✅ BusinessDetailScreen - Gallery, services, quick actions
- ✅ BookingFlowScreen - Date/time picker, summary, confirm

**Mobile Business Screens:**
- ✅ DashboardScreen - Stats, today's schedule, quick actions
- ✅ CalendarScreen - Week view with bookings
- ✅ BookingsScreen - Pending/upcoming management
- ✅ ServicesScreen - CRUD with deposits
- ✅ SettingsScreen - Business profile, availability, billing

---

## Technical Architecture

```
/app/
├── backend/
│   └── server.py      # FastAPI monolith
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AppLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js (session fixed)
│   │   ├── lib/
│   │   │   └── api.js (rezvo_token)
│   │   ├── pages/         # 12 React pages
│   │   ├── App.js
│   │   └── index.css      # Space Grotesk + Plus Jakarta Sans
│   └── tailwind.config.js
├── mobile/
│   └── rezvo-mobile/      # React Native Expo
│       ├── App.js
│       └── src/
│           ├── screens/
│           │   ├── client/    # 6 screens
│           │   └── business/  # 5 screens
│           ├── context/
│           ├── navigation/
│           └── lib/
└── memory/
    └── PRD.md
```

---

## Core Requirements Status

### Must Have (P0)
1. ✅ User authentication (signup/login with JWT)
2. ✅ Business profile setup
3. ✅ Services management (CRUD with pricing, duration, deposits)
4. ✅ Availability management
5. ✅ Shareable booking links with QR codes
6. ✅ Public booking page for clients
7. ✅ Bookings management (view, cancel)
8. ✅ Dashboard with key metrics
9. ✅ Calendar view (week/month)
10. ✅ Mobile-responsive web design
11. ✅ React Native mobile app structure

### Should Have (P1)
1. ✅ Analytics with charts
2. ⏳ AI-powered suggestions (skeleton ready)
3. ✅ Onboarding wizard
4. ⏳ Dojo payment integration (skeleton ready)
5. ⏳ Email reminders (Resend - not yet integrated)

### Could Have (P2)
1. ⏳ SMS reminders (Twilio)
2. ⏳ Admin dashboard
3. ⏳ Multi-location support
4. ⏳ Staff management

---

## Prioritized Backlog

### P0 - Critical (Next Sprint)
1. [ ] Build and test React Native app on simulator
2. [ ] Connect Dojo payment API for live deposits
3. [ ] Set up Resend for email confirmations
4. [ ] Complete public booking flow end-to-end

### P1 - Important
1. [ ] Add booking reschedule functionality
2. [ ] Implement date blocking for holidays
3. [ ] Add client management (CRM)
4. [ ] Google Calendar sync

### P2 - Nice to Have
1. [ ] Native mobile apps deployment (App Store/Play Store)
2. [ ] Multi-staff scheduling
3. [ ] Customer reviews/ratings
4. [ ] Gift vouchers
5. [ ] Stripe billing for subscriptions

---

## Test Credentials
- **Email:** testuser@example.com
- **Password:** password123

---

## Success Metrics
- **North Star:** Monthly Active Businesses
- **Key Metrics:**
  - Signups/week
  - Bookings created/week
  - Revenue per user
  - No-show rate (target: <5%)
  - Link shares (virality)

---

*Last Updated: 2026-02-04*
*Version: 1.1.0 (Fonts + Mobile App Structure)*
