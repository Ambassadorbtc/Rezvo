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
- [x] **Complete Auth Flow:**
  - Forgot Password screen (sends reset code)
  - Verify Code screen (6-digit OTP entry)
  - Reset Password screen (new password form)
  - Password Reset Success screen
- [x] **Client Flow:**
  - Home screen with categories and businesses
  - Search screen with filters
  - Bookings list (upcoming/past)
  - Business detail view
  - Full booking flow (date, time, details, confirm)
  - Profile screen
- [x] **Business Flow:**
  - Dashboard with stats and quick actions
  - Calendar with team member columns view
  - Bookings management with status actions
  - Services management with add/edit modal
  - Team Management screen
  - **Settings with functional navigation:**
    - Help Centre screen (FAQs, quick actions)
    - Contact Support screen (form, business hours)
    - Terms & Privacy screen (GDPR info, data rights)

### Backend (FastAPI + MongoDB)
- [x] Authentication endpoints (signup, login, me)
- [x] Password Reset Flow (forgot-password, verify-reset-code, reset-password)
- [x] Business management endpoints
- [x] Services CRUD endpoints
- [x] Team Members CRUD
- [x] Enhanced Calendar API with team view
- [x] Bookings endpoints with team member assignment
- [x] Public booking endpoints
- [x] AI-powered suggestions (OpenAI GPT-4o-mini)
- [x] Email notifications (Resend)
- [x] Notifications system
- [x] Products CRUD
- [x] Admin analytics endpoints
- [x] Global search endpoint

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
- **team_members:** id, business_id, name, email, phone, role, color, service_ids
- **password_resets:** email, code, expires, used, reset_token
- **notifications:** id, userId, title, message, type, read
- **short_links:** id, short_code, business_id, clicks
- **products:** id, business_id, name, price_pence, stock_quantity

## Application URLs
- **Web Landing:** https://bookrezvo.preview.emergentagent.com
- **Web Dashboard:** https://bookrezvo.preview.emergentagent.com/dashboard
- **Mobile Preview:** https://bookrezvo.preview.emergentagent.com/mobile-preview
- **Admin Panel:** https://bookrezvo.preview.emergentagent.com/admin

## Known Issues
1. **Global Search (DISABLED):** The SearchModal component causes a "Maximum call stack size exceeded" error due to a conflict with the babel-metadata-plugin. Feature removed until resolved.

## P0 - Next Priority Tasks
1. Wire onboarding wizard to backend (complete business setup flow)
2. Full client-side mobile app functionality (backend wiring)
3. Push notifications (Expo)

## P1 - Upcoming Tasks
- Stripe subscription integration (£4.99/month)
- Google Calendar sync
- Automated booking reminders (cron/scheduled)
- SMS notifications (Twilio)
- Fix global search feature

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
│   └── server.py          # FastAPI with all endpoints
├── frontend/
│   └── src/
│       ├── components/    
│       │   ├── AppLayout.jsx      # Main navigation layout
│       │   ├── CookieConsent.jsx  # GDPR cookie popup
│       │   └── ui/                # Shadcn components
│       └── pages/         
│           ├── DashboardPage.jsx
│           ├── CalendarPage.jsx   # Team view calendar
│           ├── MobilePreview.jsx  # Browser mobile simulator
│           └── ...
├── mobile/
│   └── rezvo-mobile/
│       └── src/
│           ├── navigation/
│           │   └── AppNavigator.js  # Auth/Business/Client stacks
│           ├── screens/
│           │   ├── WelcomeScreen.js
│           │   ├── LoginScreen.js
│           │   ├── SignupScreen.js
│           │   ├── ForgotPasswordScreen.js
│           │   ├── VerifyCodeScreen.js
│           │   ├── ResetPasswordScreen.js
│           │   ├── PasswordResetSuccessScreen.js
│           │   ├── HelpCentreScreen.js      # NEW
│           │   ├── ContactSupportScreen.js  # NEW
│           │   ├── TermsPrivacyScreen.js    # NEW
│           │   ├── business/
│           │   │   ├── DashboardScreen.js
│           │   │   ├── CalendarScreen.js
│           │   │   ├── BookingsScreen.js
│           │   │   ├── ServicesScreen.js
│           │   │   ├── SettingsScreen.js    # UPDATED - uses navigation
│           │   │   └── TeamScreen.js
│           │   └── client/
│           └── context/
│               └── AuthContext.js
└── memory/
    └── PRD.md
```

## Last Updated
February 4, 2026 - Session 3:
- Fixed mobile app settings navigation (Help Centre, Contact Support, Terms & Privacy now accessible)
- Added screens to AppNavigator for both Business and Client stacks
- Updated SettingsScreen to use navigation.navigate() instead of Linking.openURL()
- Removed SearchModal due to babel plugin conflict (global search disabled)
- Added data-testid to CookieConsent for testing
- All backend (37/37 tests) and frontend tests passing
