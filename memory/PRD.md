# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP for UK micro-businesses. The core platform includes:
- A web-first responsive platform (React frontend + FastAPI backend)
- A native mobile app (React Native/Expo)
- SMS OTP-based authentication with optional Google OAuth
- Brandable customer-facing public booking pages
- Two-way support messaging system
- Comprehensive business settings management

## User Personas
1. **Business Owner** - UK micro-business owner (hairdressers, personal trainers, etc.) managing appointments
2. **Founder/Admin** - Platform administrator managing businesses, users, and support
3. **Customer** - End users booking appointments (future)

## Core Requirements
- Shareable booking links for customers
- Smart calendar with day/week/month views
- Automated reminders (email/SMS)
- Simple analytics and revenue tracking
- Products feature for businesses to sell items
- Support ticketing system

## Technical Architecture
- **Backend:** FastAPI, MongoDB, JWT authentication
- **Frontend Web:** React, React Router, Tailwind CSS, Shadcn/UI
- **Frontend Mobile:** React Native, Expo (tunnel mode)
- **Database:** MongoDB (test_database)
- **SMS:** Sendly.live API for OTP
- **OAuth:** Emergent-managed Google Auth

## What's Been Implemented

### Feb 6, 2026 - Session 2 (Current)
- ✅ **FIXED: Google Auth flow** - Updated AuthCallbackPage.jsx to use correct Emergent Auth endpoint (`https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data` with X-Session-ID header)
- ✅ **FIXED: Expo Auto-Start** - Added supervisor config `/etc/supervisor/conf.d/mobile.conf` for automatic Expo server management
- ✅ **FIXED: Session ID race condition** - Added synchronous hash detection in App.js routes for session_id
- ✅ **FIXED: StrictMode double-processing** - Added useRef flag in AuthCallbackPage.jsx

### Feb 6, 2026 - SMS OTP Authentication
- ✅ Complete signup flow with SMS OTP verification via Sendly.live
  - Welcome page, User type selection, Phone verification
  - Profile completion with Google or Email options
  - Onboarding wizard (business type, location, team)
- ✅ Forgot password flow with SMS OTP
- ✅ 22 business type categories in onboarding
- ✅ All new auth pages fully mobile responsive

### Feb 6, 2026 - Mobile Responsiveness
- ✅ Founder Admin Page - Full mobile responsive layout with collapsible sidebar
- ✅ Calendar Page - Compact mobile header, scrollable calendar grid
- ✅ Settings Page - Scrollable tabs on mobile with icon-only display
- ✅ Dashboard, Bookings, Support pages already responsive

### Previous Sessions
- ✅ Full authentication system (JWT)
- ✅ Business Owner portal with dashboard, calendar, bookings
- ✅ Founder Admin portal with stats, user management, support inbox
- ✅ Public booking page with service selection and time slots
- ✅ Support chat system with real-time polling
- ✅ Live chat settings for founder admin
- ✅ Team member management
- ✅ Services and Products CRUD
- ✅ Notification system
- ✅ Mobile app (Expo) - basic functionality

## New Auth Flow Routes
- `/signup` - Main signup page (TailAdmin style with business images)
- `/signup/profile` - Profile completion page
- `/signup/verify-phone` - SMS OTP verification
- `/signup/business-type` - Business type selection
- `/forgot-password` - Password reset via SMS OTP
- `/auth-callback` - Google OAuth callback

## Prioritized Backlog

### P0 - Critical (RESOLVED)
- [x] Google Auth "Token error" - FIXED
- [x] Expo server auto-start - FIXED (supervisor config added)

### P1 - Important  
- [ ] Unified live chat sync verification (web ↔ mobile) - Both use same polling, needs user testing
- [ ] Mobile calendar alignment fix - UI was already corrected, needs user verification
- [ ] New bookings not appearing on web calendar - Needs testing

### P2 - Nice to Have
- [ ] Founder Platform Settings backend implementation
- [ ] Add Rezvo logo to chat avatars
- [ ] Email relay for support messages (requires Resend integration)
- [ ] Summary email on conversation close
- [ ] Customer signup flow

### P3 - Future
- [ ] Dojo Payment Integration
- [ ] Mobile calendar drag-and-drop
- [ ] Google Calendar Sync
- [ ] Full settings parity web/mobile

## 3rd Party Integrations
- **Sendly.live** - SMS OTP (API Key configured in backend/.env)
- **Emergent Auth** - Google OAuth
- **MongoDB** - Database
- **Expo** - Mobile app framework (now auto-managed by supervisor)

## Test Credentials
- **Founder:** founder@rezvo.app / Founder123!
- **Business Owner:** testuser@example.com / password123

## Key URLs
- Web App: https://micro-biz-book.preview.emergentagent.com
- Signup Page: https://micro-biz-book.preview.emergentagent.com/signup
- Login Page: https://micro-biz-book.preview.emergentagent.com/login
- Expo QR: https://x-pynq4-anonymous-8081.exp.direct
- API Base: https://micro-biz-book.preview.emergentagent.com/api

## Key Files Modified This Session
- `/app/frontend/src/pages/auth/AuthCallbackPage.jsx` - Fixed Google Auth endpoint
- `/app/frontend/src/App.js` - Added synchronous session_id hash detection
- `/etc/supervisor/conf.d/mobile.conf` - NEW: Expo auto-start config

## Testing Reports
- `/app/test_reports/iteration_18.json` - All tests passing (Google Auth, login flows, dashboard, support)
