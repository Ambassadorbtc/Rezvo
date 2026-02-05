# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP called `rezvo.app` for UK micro-businesses. The application includes a web-first responsive application for businesses and a native mobile app for both clients and businesses. The design aesthetic is "super modern," inspired by UK challenger banks Monzo and Starling.

## User Personas
1. **Business Owner** - UK micro-business (hairdresser, nail tech, barber, PT, etc.)
2. **Client** - End customer who wants to book appointments easily
3. **Founder/Admin** - Platform administrator who monitors the system

## What's Been Implemented ✅

### Web Application (React) - COMPLETE
- [x] Landing page with modern design
- [x] User authentication (JWT-based)
- [x] Business dashboard with stats
- [x] **Global Search** - ⌘K shortcut, searches bookings/services/customers
- [x] **Calendar with Day/Week/Month views**
- [x] **Team Management** - Inline editing, branded delete dialog, profile images
- [x] **Public Booking Page** - Team selection, time slots, 3-step flow
- [x] Services management (CRUD)
- [x] Bookings management
- [x] Analytics dashboard
- [x] Settings page
- [x] Shareable booking links with QR codes
- [x] Legal pages + Cookie consent
- [x] Onboarding wizard (UI + Backend wired)
- [x] Founder Admin Panel
- [x] **Data Seeding Script** - /app/backend/seed_data.py

### Mobile Application (React Native/Expo)
- [x] Welcome/Login/Signup screens
- [x] Complete Auth Flow
- [x] Client Flow (Home, Search, Bookings, Profile, Business Detail, Booking)
- [x] Business Flow (Dashboard, Calendar, Bookings, Services, Team, Settings)
- [x] Settings navigation (Help Centre, Contact Support, Terms & Privacy)
- [x] Improved error handling in DashboardScreen

### Backend (FastAPI + MongoDB) - COMPLETE
- [x] Authentication + Password Reset
- [x] Business management with availability
- [x] Services CRUD
- [x] Team Members CRUD with visibility toggle
- [x] Image Upload endpoint
- [x] Public endpoints (business, services, team, bookings)
- [x] Calendar API with team view
- [x] Bookings with team member assignment
- [x] Global Search endpoint
- [x] AI suggestions (OpenAI GPT-4o-mini)
- [x] Email notifications (Resend)
- [x] Onboarding endpoints
- [x] Products CRUD
- [x] Admin analytics

## Application URLs
| Page | URL |
|------|-----|
| Landing | https://rezvo-booking-1.preview.emergentagent.com |
| Dashboard | https://rezvo-booking-1.preview.emergentagent.com/dashboard |
| Calendar | https://rezvo-booking-1.preview.emergentagent.com/calendar |
| Team | https://rezvo-booking-1.preview.emergentagent.com/team |
| Public Booking | https://rezvo-booking-1.preview.emergentagent.com/book/{businessId} |
| Mobile Preview | https://rezvo-booking-1.preview.emergentagent.com/mobile-preview |
| Admin | https://rezvo-booking-1.preview.emergentagent.com/admin |

## Test Credentials
- **Email:** testuser@example.com
- **Password:** password123
- **Business ID:** 3edbbbc1-730a-494e-9626-1a0a5e6309ef

## Expo Mobile App
```bash
cd /app/mobile/rezvo-mobile && npx expo start --clear
```

## Seeding Script
```bash
cd /app/backend && python seed_data.py
```
Creates: 6 team members, 6 services, 116 bookings, 5 notifications

## Remaining Features (P1/P2)

### P1 - Next Priority
- [ ] Stripe subscription (£4.99/month)
- [ ] Google Calendar sync
- [ ] Push notifications (Expo)
- [ ] SMS notifications (Twilio)
- [ ] Automated booking reminders

### P2 - Future/Backlog
- [ ] Multi-location support
- [ ] Advanced team scheduling
- [ ] Customer reviews
- [ ] Staff separate logins

## Testing Status
- **Backend:** 100% (21/21 tests passed)
- **Frontend:** 100% (all UI tests passed)
- **Iteration:** 11

## Last Updated
February 5, 2026 - Session 8:
- Re-enabled Global Search with ⌘K shortcut
- Created data seeding script (seed_data.py)
- Improved mobile DashboardScreen error handling
- All tests passing (100% backend, 100% frontend)
- Expo server running for mobile testing
