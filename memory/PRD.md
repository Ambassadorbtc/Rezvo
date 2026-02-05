# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP, `rezvo.app`, for UK micro-businesses. The core of the application is a web-first responsive platform and a native mobile app for both clients and businesses. The design should be "super modern," inspired by challenger banks like Monzo.

## User Personas
1. **Business Owner** - Manages bookings, team, services, and calendar
2. **Staff Member** - Views assigned bookings and personal schedule
3. **Client** - Books appointments through public booking page

## Core Requirements
- **Monetization:** £4.99/month subscription via Stripe (deferred)
- **Core Feature:** Businesses generate shareable booking links
- **Platforms:** React web app + React Native/Expo mobile app
- **Design:** Light theme with teal accents, Space Grotesk/Plus Jakarta Sans fonts

## Tech Stack
- **Backend:** FastAPI, MongoDB, JWT auth
- **Frontend (Web):** React, Tailwind CSS, Shadcn/UI
- **Frontend (Mobile):** React Native, Expo SDK 54
- **Integrations:** Resend (email), OpenAI GPT-4o-mini

---

## What's Been Implemented

### Session: February 5, 2026

#### Expo Mobile App Fix (P0 CRITICAL)
- ✅ Fixed "expected dynamic type 'boolean'" crash
- ✅ Root cause: react-native-screens 4.22.0 incompatible with Expo SDK 54
- ✅ Solution: Pinned react-native-screens to exact version 4.16.0
- ✅ Mobile app now works correctly

#### UI/UX Improvements
1. ✅ Removed native Alert notifications - using custom toasts
2. ✅ Tightened mobile Settings profile card
3. ✅ Added profile photo editing with expo-image-picker
4. ✅ Search as dropdown instead of modal (web)
5. ✅ Fixed Calendar Day/Week/Month tab position jumping
6. ✅ Enhanced calendar typography and styling
7. ✅ Added draggable appointments (drag & drop)
8. ✅ Added double-click to create booking
9. ✅ Fixed Help Centre quick action buttons

#### Backend Features Added
- ✅ Business logo upload endpoint
- ✅ Google Calendar integration (needs API keys)
- ✅ Push notification system (Expo)
- ✅ Automated booking reminders (scheduler)
- ✅ Staff separate logins
- ✅ Customer reviews & ratings
- ✅ Multi-location support
- ✅ Advanced scheduling (shifts, time-off)

### Previous Sessions
- ✅ Full authentication system (JWT)
- ✅ Business onboarding wizard
- ✅ Service management CRUD
- ✅ Team management with inline editing
- ✅ Public booking page with team selection
- ✅ Multi-view calendar (Day/Week/Month)
- ✅ Global search functionality
- ✅ Data seeding script
- ✅ Branded email notifications (Resend)

---

## Known Issues & Technical Debt

### Workaround Active
- `babel-metadata-plugin` disabled in `/app/frontend/craco.config.js`
- Prevents crashes on TeamPage and SearchModal
- Re-enabling will cause "Maximum call stack size exceeded" error

### Mobile Dependencies (Pinned)
```
react-native-screens: 4.16.0 (exact)
@react-navigation/native: ^6.1.18
@react-navigation/native-stack: ^6.9.26
@react-navigation/bottom-tabs: ^6.5.20
```

---

## Prioritized Backlog

### P1 - High Priority
- [ ] Stripe subscription (£4.99/month)
- [ ] Google Calendar sync (needs API keys from user)
- [ ] Push notifications (Expo push service)
- [ ] Twilio SMS reminders

### P2 - Medium Priority
- [ ] Staff separate logins (backend ready)
- [ ] Customer reviews UI (backend ready)
- [ ] Multi-location UI (backend ready)
- [ ] Advanced scheduling UI (backend ready)

### P3 - Future
- [ ] Two-way Google Calendar sync
- [ ] Customer mobile app screens
- [ ] Analytics dashboard enhancements
- [ ] Fix babel-metadata-plugin properly

---

## API Endpoints

### Core
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/business` - Get business details
- `PATCH /api/business` - Update business
- `POST /api/business/logo` - Upload logo

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/{id}` - Update booking (supports drag/drop)
- `POST /api/bookings/{id}/cancel` - Cancel booking

### Team
- `GET /api/team-members` - List team
- `POST /api/team-members` - Add member
- `POST /api/team-members/{id}/avatar` - Upload avatar

### New Features
- `GET /api/google/auth-url` - Google OAuth
- `POST /api/push/register` - Register push token
- `GET /api/reviews` - Business reviews
- `GET /api/locations` - Business locations
- `GET /api/shifts` - Team shifts

---

## Credentials

### Test Account
- Email: `testuser@example.com`
- Password: `password123`

### Expo Mobile
- URL: `exp://tjyr168-anonymous-8081.exp.direct`
- QR: https://rezvo-booking-1.preview.emergentagent.com/expo-test
