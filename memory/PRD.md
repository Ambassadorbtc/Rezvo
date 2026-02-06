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
- `/welcome` - Welcome page
- `/get-started` - User type selection
- `/verify-phone` - SMS OTP verification
- `/complete-profile` - Profile details + auth method
- `/onboarding-wizard` - Business setup wizard
- `/forgot-password` - Password reset via SMS OTP
- `/auth-callback` - Google OAuth callback

## Prioritized Backlog

### P0 - Critical
- [ ] Expo server auto-start (supervisor config)
- [ ] Unified live chat sync (web ↔ mobile)
- [ ] Mobile calendar alignment fix

### P1 - Important  
- [ ] New bookings not appearing on web calendar
- [ ] Web chat occasional page refresh requirement
- [ ] Test full signup flow end-to-end

### P2 - Nice to Have
- [ ] Founder Platform Settings backend implementation
- [ ] Add Rezvo logo to chat avatars
- [ ] Email relay for support messages
- [ ] Summary email on conversation close
- [ ] Customer signup flow

### P3 - Future
- [ ] Dojo Payment Integration
- [ ] Mobile calendar drag-and-drop
- [ ] Google Calendar Sync
- [ ] Full settings parity web/mobile

## 3rd Party Integrations
- **Sendly.live** - SMS OTP (API Key configured)
- **Emergent Auth** - Google OAuth
- **MongoDB** - Database
- **Expo** - Mobile app framework

## Test Credentials
- **Founder:** founder@rezvo.app / Founder123!
- **Business Owner:** testuser@example.com / password123

## Key URLs
- Web App: https://rez-services.preview.emergentagent.com
- Welcome Page: https://rez-services.preview.emergentagent.com/welcome
- Expo QR: https://rez-services.preview.emergentagent.com/expo-qr.html
- API Base: https://rez-services.preview.emergentagent.com/api
