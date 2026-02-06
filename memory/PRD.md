# Rezvo.app - Product Requirements Document

## Original Problem Statement
Build a booking application MVP for UK micro-businesses. The core platform includes:
- A web-first responsive platform (React frontend + FastAPI backend)
- A native mobile app (React Native/Expo)
- JWT-based authentication for Business Owners and Founder admin
- Brandable customer-facing public booking pages
- Two-way support messaging system
- Comprehensive business settings management

## User Personas
1. **Business Owner** - UK micro-business owner (hairdressers, personal trainers, etc.) managing appointments
2. **Founder/Admin** - Platform administrator managing businesses, users, and support

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

## What's Been Implemented

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

## Prioritized Backlog

### P0 - Critical
- [ ] Expo server auto-start (supervisor config)
- [ ] Unified live chat sync (web ↔ mobile)
- [ ] Mobile calendar alignment fix

### P1 - Important  
- [ ] New bookings not appearing on web calendar
- [ ] Web chat occasional page refresh requirement

### P2 - Nice to Have
- [ ] Founder Platform Settings backend implementation
- [ ] Add Rezvo logo to chat avatars
- [ ] Email relay for support messages
- [ ] Summary email on conversation close

### P3 - Future
- [ ] Dojo Payment Integration
- [ ] Mobile calendar drag-and-drop
- [ ] Google Calendar Sync
- [ ] Full settings parity web/mobile

## Test Credentials
- **Founder:** founder@rezvo.app / Founder123!
- **Business Owner:** testuser@example.com / password123

## Key URLs
- Web App: https://bizbook-27.preview.emergentagent.com
- Expo QR: https://bizbook-27.preview.emergentagent.com/expo-qr.html
- API Base: https://bizbook-27.preview.emergentagent.com/api
