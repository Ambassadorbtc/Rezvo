# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP called `rezvo.app` for UK micro-businesses. The application includes a web-first responsive application for businesses and a native mobile app for both clients and businesses. The design aesthetic is "super modern," inspired by UK challenger banks Monzo and Starling.

## User Personas
1. **Business Owner** - UK micro-business (hairdresser, nail tech, barber, PT, etc.)
2. **Client** - End customer who wants to book appointments easily
3. **Founder/Admin** - Platform administrator who monitors the system

## What's Been Implemented ✅

### Web Application (React)
- [x] Landing page with modern design
- [x] User authentication (JWT-based)
- [x] Business dashboard with stats
- [x] **Calendar with Day/Week/Month views**
  - Day view with team member columns
  - Week view with booking counts
  - Month view with full calendar
  - Team avatars in header (link to /team)
- [x] **Team Management Page**
  - Premium table with inline editing
  - Round profile avatars with colors
  - Branded delete confirmation dialog
  - Profile image upload
  - "Show on booking page" toggle
  - Newest members sorted first
- [x] **Public Booking Page** (ENHANCED)
  - Team member selection with avatars
  - "Any available" option
  - Time slot selection
  - Complete 3-step booking flow
  - Shows team member in summary
- [x] Services management (CRUD)
- [x] Bookings management
- [x] Analytics dashboard
- [x] Settings page
- [x] Shareable booking links with QR codes
- [x] Legal pages: Privacy, Terms, Cookie Policy
- [x] Cookie consent popup
- [x] Onboarding wizard UI
- [x] Founder Admin Panel

### Mobile Application (React Native/Expo)
- [x] Welcome/Login/Signup screens
- [x] Complete Auth Flow
- [x] Client Flow (Home, Search, Bookings, Profile, Business Detail, Booking)
- [x] Business Flow (Dashboard, Calendar, Bookings, Services, Team, Settings)
- [x] Settings navigation (Help Centre, Contact Support, Terms & Privacy)

### Backend (FastAPI + MongoDB)
- [x] Authentication endpoints
- [x] Password Reset Flow
- [x] Business management with availability
- [x] Services CRUD
- [x] Team Members CRUD with visibility toggle
- [x] Image Upload endpoint
- [x] Public endpoints (business, services, team, bookings)
- [x] Calendar API with team view
- [x] Bookings with team member assignment
- [x] AI-powered suggestions
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
| Public Booking | https://bookrezvo.preview.emergentagent.com/book/{businessId} |
| Mobile Preview | https://bookrezvo.preview.emergentagent.com/mobile-preview |
| Admin | https://bookrezvo.preview.emergentagent.com/admin |

## Test Credentials
- **Email:** testuser@example.com
- **Password:** password123
- **Business ID:** 3edbbbc1-730a-494e-9626-1a0a5e6309ef

## Expo Mobile App
```bash
cd /app/mobile/rezvo-mobile && npx expo start --clear
```

## P0 - Next Priority Tasks
1. Wire onboarding wizard to backend
2. Push notifications (Expo)
3. Client mobile app backend wiring

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
February 5, 2026 - Session 7:
- Fixed public booking page - now shows team members and time slots
- Added team member selection to booking flow
- Added default availability for all days
- All tests passing (100% frontend)
- Complete booking flow verified working
