# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP called `rezvo.app` for UK micro-businesses. The application includes a web-first responsive application for businesses and a native mobile app for both clients and businesses. The design aesthetic is "super modern," inspired by UK challenger banks Monzo and Starling.

## User Personas
1. **Business Owner** - UK micro-business (hairdresser, nail tech, barber, PT, etc.)
2. **Client** - End customer who wants to book appointments easily
3. **Founder/Admin** - Platform administrator who monitors the system

## What's Been Implemented

### Web Application (React) ✅
- [x] Landing page with modern design
- [x] User authentication (JWT-based)
- [x] Business dashboard with stats
- [x] **Calendar with Day/Week/Month views** (NEW)
  - Day view with team columns
  - Week view with bookings grid
  - Month view with calendar grid
- [x] **Team Management Page** (REDESIGNED)
  - Premium table with inline editing
  - Round profile avatars with colors
  - Branded delete confirmation dialog (no browser alerts)
  - New members sorted to top
  - Profile image upload
  - "Show on booking page" toggle
- [x] **Calendar team avatars** - Profile icons link to /team (replaced Team button)
- [x] Services management (CRUD)
- [x] Bookings management
- [x] Analytics dashboard
- [x] Settings page
- [x] Shareable booking links with QR codes
- [x] Public booking page
- [x] Legal pages: Privacy, Terms, Cookie Policy
- [x] Cookie consent popup
- [x] Onboarding wizard UI
- [x] Founder Admin Panel

### Mobile Application (React Native/Expo)
- [x] Welcome/Login/Signup screens
- [x] Complete Auth Flow (Forgot Password, Verify Code, Reset)
- [x] Client Flow (Home, Search, Bookings, Profile, Business Detail, Booking Flow)
- [x] Business Flow (Dashboard, Calendar, Bookings, Services, Team, Settings)
- [x] Settings navigation (Help Centre, Contact Support, Terms & Privacy)

### Backend (FastAPI + MongoDB)
- [x] Authentication endpoints
- [x] Password Reset Flow
- [x] Business management
- [x] Services CRUD
- [x] Team Members CRUD with visibility toggle
- [x] Image Upload (POST /api/upload/avatar)
- [x] Public Team endpoint (filtered by visibility)
- [x] Calendar API with team view
- [x] Bookings endpoints
- [x] AI-powered suggestions (OpenAI GPT-4o-mini)
- [x] Email notifications (Resend)
- [x] Products CRUD
- [x] Admin analytics

## Application URLs
| Page | URL |
|------|-----|
| Landing | https://bookrezvo.preview.emergentagent.com |
| Dashboard | https://bookrezvo.preview.emergentagent.com/dashboard |
| Calendar | https://bookrezvo.preview.emergentagent.com/calendar |
| Team | https://bookrezvo.preview.emergentagent.com/team |
| Mobile Preview | https://bookrezvo.preview.emergentagent.com/mobile-preview |
| Admin | https://bookrezvo.preview.emergentagent.com/admin |

## Test Credentials
- **Email:** testuser@example.com
- **Password:** password123

## Expo Mobile App
```bash
cd /app/mobile/rezvo-mobile && npx expo start --clear
```
Scan QR code with Expo Go app on your phone.

## P0 - Next Priority Tasks
1. Wire onboarding wizard to backend
2. Team selection on public booking page
3. Full client mobile app backend wiring
4. Push notifications (Expo)

## P1 - Upcoming Tasks
- Stripe subscription (£4.99/month)
- Google Calendar sync
- Automated booking reminders
- SMS notifications (Twilio)

## P2 - Future/Backlog
- Multi-location support
- Advanced team scheduling
- Customer reviews
- Staff separate logins
- Re-enable global search

## Last Updated
February 4, 2026 - Session 6:
- Added Day/Week/Month view tabs to Calendar
- Replaced "Team (N)" button with team member profile avatars
- Avatars now link to /team page
- Replaced browser `confirm()` with branded delete dialog
- Team members now sorted by creation date (newest first)
- Expo server restarted for mobile testing
