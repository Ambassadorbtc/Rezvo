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
- [x] Calendar view for availability
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

### Mobile Application (React Native/Expo) - UPDATED FEB 2026
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
  - **Enhanced Calendar** - Fresha/Booksy-style with:
    - Team member columns view
    - Color-coded bookings by service
    - Week strip navigation
    - Add booking modal with team member assignment
    - Date navigation controls
  - Bookings management with status actions
  - Services management with add/edit modal
  - **Team Management** - Add/edit team members:
    - Color assignment for calendar
    - Role selection (staff/manager/admin)
    - Service assignment capabilities
    - Performance tracking (bookings, revenue)
  - Settings with share link, business details modals

### Backend (FastAPI + MongoDB) - UPDATED FEB 2026
- [x] Authentication endpoints (signup, login, me)
- [x] **Password Reset Flow:**
  - POST /api/auth/forgot-password
  - POST /api/auth/verify-reset-code
  - POST /api/auth/reset-password
- [x] Business management endpoints
- [x] Services CRUD endpoints
- [x] **Team Members CRUD:**
  - POST /api/team-members
  - GET /api/team-members
  - GET /api/team-members/{id}
  - PATCH /api/team-members/{id}
  - DELETE /api/team-members/{id}
  - GET /api/team-members/{id}/stats
- [x] **Enhanced Calendar API:**
  - GET /api/calendar/team-view?date=YYYY-MM-DD
- [x] Bookings endpoints with team member assignment
  - POST /api/bookings/with-team
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
- **team_members:** id, business_id, name, email, phone, role, color, service_ids, working_hours, bookings_completed, revenue_pence
- **password_resets:** email, code, expires, used, reset_token
- **notifications:** id, userId, title, message, type, read
- **short_links:** id, short_code, business_id, clicks
- **error_logs:** id, type, message, stack, resolved
- **products:** id, business_id, name, price_pence, stock_quantity

## Testing URLs
- **Web Landing:** https://slotwise-6.preview.emergentagent.com
- **Expo QR Page:** https://slotwise-6.preview.emergentagent.com/expo-test
- **Mobile Preview:** https://slotwise-6.preview.emergentagent.com/mobile-preview
- **Expo Tunnel:** exp://3ckafhi-anonymous-8081.exp.direct

## P0 - Next Priority Tasks
1. Wire onboarding wizard to backend (complete business setup flow)
2. Full client-side mobile app functionality (backend wiring)
3. Push notifications (Expo)

## P1 - Upcoming Tasks
- Stripe subscription integration (£4.99/month)
- Google Calendar sync
- Automated booking reminders (cron/scheduled)
- SMS notifications (Twilio)

## P2 - Future/Backlog
- Multi-location business support
- Advanced team scheduling (shift management)
- Customer reviews
- Advanced analytics/reports
- Dojo payment integration (deferred)

## Code Architecture
```
/app/
├── backend/
│   └── server.py          # FastAPI with all endpoints (~2100 lines)
├── frontend/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       └── App.js         # Routes
├── mobile/
│   └── rezvo-mobile/
│       └── src/
│           ├── screens/
│           │   ├── WelcomeScreen.js
│           │   ├── LoginScreen.js
│           │   ├── SignupScreen.js
│           │   ├── ForgotPasswordScreen.js (NEW)
│           │   ├── VerifyCodeScreen.js (NEW)
│           │   ├── ResetPasswordScreen.js (NEW)
│           │   ├── PasswordResetSuccessScreen.js (NEW)
│           │   ├── business/
│           │   │   ├── DashboardScreen.js
│           │   │   ├── CalendarScreen.js (ENHANCED)
│           │   │   ├── BookingsScreen.js
│           │   │   ├── ServicesScreen.js
│           │   │   ├── SettingsScreen.js
│           │   │   └── TeamScreen.js (NEW)
│           │   └── client/
│           ├── navigation/
│           │   └── AppNavigator.js
│           └── context/
│               └── AuthContext.js
└── memory/
    └── PRD.md
```

## Last Updated
February 4, 2026 - Session 2:
- Completely redesigned web Calendar page (Fresha/Booksy-style with team columns)
- Updated MobilePreview.jsx with Expo SDK 52 badge and complete auth flow screens
- Auth flow screens: Sign In, Sign Up, Phone Verify, Security Code, Forgot Password, Mail Confirm, Reset Password, Reset Success
- Screen Navigator for easy navigation between all app screens

February 4, 2026 - Session 1:
- Added Team Management, Calendar Redesign, Complete Auth Flow backend APIs
