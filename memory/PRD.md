# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP, `rezvo.app`, for UK micro-businesses. The core of the application is a web-first responsive platform and a native mobile app for both clients and businesses. The design should be "super modern," inspired by challenger banks like Monzo.

## User Personas
1. **Business Owner** - Manages bookings, team, services, and calendar
2. **Staff Member** - Views assigned bookings and personal schedule
3. **Client** - Books appointments through public booking page
4. **Founder Admin** - Manages all users, businesses, and support tickets

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

### Session: February 5, 2026 (Latest)

#### Login Page Premium Redesign
- ✅ Split-screen layout with rotating business images
- ✅ Images showcase target market (salons, barbers, spas)
- ✅ Trust badges (SSL, GDPR)
- ✅ Modern form styling with branded colors

#### Support Messaging System
- ✅ Backend APIs: `/api/conversations`, `/api/conversations/{id}/messages`
- ✅ Admin API: `/api/admin/conversations`
- ✅ Web frontend: `/support` route with full chat interface
- ✅ Real-time polling for new messages

#### Mobile Calendar Overhaul
- ✅ Day/Week/Month view tabs
- ✅ Team member columns with avatars
- ✅ Tap on time slot to add booking
- ✅ Booking detail modal (custom, not Alert.alert)
- ✅ Service-colored booking blocks

#### Mobile Analytics Screen
- ✅ Revenue, bookings, completion rate metrics
- ✅ Weekly bookings bar chart
- ✅ Top services breakdown
- ✅ Linked from Dashboard stat cards

#### Mobile Settings Improvements
- ✅ Custom logout confirmation modal
- ✅ Toast notification utility created

### Previous Sessions
- ✅ Full authentication system (JWT)
- ✅ Business onboarding wizard
- ✅ Service management CRUD
- ✅ Team management with inline editing
- ✅ Public booking page with team selection
- ✅ Multi-view calendar (Day/Week/Month) - Web
- ✅ Global search functionality - Web
- ✅ Data seeding script
- ✅ Branded email notifications (Resend)
- ✅ Expo mobile app crash fix (react-native-screens 4.16.0)

---

## Known Issues & Technical Debt

### Alert.alert() Still Present In:
- LoginScreen.js
- SignupScreen.js
- BookingsScreen.js (business)
- ServicesScreen.js (business)
- TeamScreen.js (business)
- Various auth screens

**Fix:** Use `/app/mobile/rezvo-mobile/src/lib/toast.js` utility

### Workarounds Active
- `babel-metadata-plugin` disabled in `/app/frontend/craco.config.js`

### Mobile Dependencies (Pinned)
```
react-native-screens: 4.16.0 (exact)
@react-navigation/native: ^6.1.18
@react-navigation/native-stack: ^6.9.26
@react-navigation/bottom-tabs: ^6.5.20
```

---

## Prioritized Backlog

### P0 - Critical
- [ ] Replace remaining Alert.alert() calls in mobile app

### P1 - High Priority
- [ ] Connect Founders Portal to support messaging
- [ ] Complete profile photo upload in mobile Settings
- [ ] Add double-click to add booking in web Calendar
- [ ] Stripe subscription (£4.99/month)

### P2 - Medium Priority
- [ ] Google Calendar sync
- [ ] Push notifications (Expo)
- [ ] SMS reminders (Twilio)
- [ ] Staff separate logins UI

### P3 - Future
- [ ] Two-way Google Calendar sync
- [ ] Customer mobile app API connections
- [ ] Advanced analytics dashboard
- [ ] Fix babel-metadata-plugin properly

---

## API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/staff-login` - Staff login

### Business
- `GET /api/business` - Get business details
- `PATCH /api/business` - Update business
- `POST /api/business/logo` - Upload logo

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/{id}` - Update booking

### Team
- `GET /api/team-members` - List team
- `POST /api/team-members` - Add member
- `POST /api/team-members/{id}/avatar` - Upload avatar

### Support Messaging (NEW)
- `GET /api/conversations` - User's conversations
- `POST /api/conversations` - Start conversation
- `GET /api/conversations/{id}/messages` - Get messages
- `POST /api/conversations/{id}/messages` - Send message
- `GET /api/admin/conversations` - Admin: all support tickets

### Reviews
- `GET /api/reviews` - Business reviews
- `POST /api/reviews` - Submit review
- `GET /api/public/business/{id}/reviews` - Public reviews

### Locations
- `GET /api/locations` - Business locations
- `POST /api/locations` - Add location

### Scheduling
- `GET /api/shifts` - Team shifts
- `POST /api/shifts` - Create shift
- `GET /api/time-off` - Time off requests

---

## Credentials

### Test Account
- Email: `testuser@example.com`
- Password: `password123`

### Expo Mobile
- URL: `exp://tjyr168-anonymous-8081.exp.direct`
- QR: https://rezvo-booking-1.preview.emergentagent.com/expo-test

### Web URLs
- Login: https://rezvo-booking-1.preview.emergentagent.com/login
- Dashboard: https://rezvo-booking-1.preview.emergentagent.com/dashboard
- Calendar: https://rezvo-booking-1.preview.emergentagent.com/calendar
- Support: https://rezvo-booking-1.preview.emergentagent.com/support
