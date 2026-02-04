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
- [x] Analytics dashboard with charts
- [x] Settings page with business details
- [x] Shareable booking links with QR codes
- [x] Public booking page for customers
- [x] Legal pages: Privacy, Terms, Cookie Policy
- [x] Cookie consent popup (GDPR compliant)
- [x] Onboarding wizard UI (4 steps)

### Mobile Application (React Native/Expo)
- [x] Welcome screen with onboarding slides
- [x] Login/Signup screens with user type toggle
- [x] **Client Flow:**
  - Home screen with categories and businesses
  - Search screen with filters
  - Bookings list (upcoming/past)
  - Business detail view
  - Full booking flow (date, time, details, confirm)
  - Profile screen (NO switch to business mode)
- [x] **Business Flow:**
  - Dashboard with stats and quick actions
  - Calendar with week view
  - Bookings management with status actions
  - Services management with add/edit modal
  - Settings with share link generation

### Backend (FastAPI + MongoDB)
- [x] Authentication endpoints (signup, login, me)
- [x] Business management endpoints
- [x] Services CRUD endpoints
- [x] Bookings endpoints with status management
- [x] Public booking endpoints
- [x] AI-powered suggestions (OpenAI GPT-4o-mini)
- [x] Email notifications (Resend)
- [x] Notifications system
- [x] Error logging system
- [x] Short link generation and resolution
- [x] Seed data endpoint (10 dummy customers)
- [x] Business stats/analytics endpoint

### Integrations
- [x] OpenAI GPT-4o-mini (via Emergent LLM Key)
- [x] Resend for email notifications
- [x] React Native / Expo for mobile

## Test Credentials
- **Email:** testuser@example.com
- **Password:** password123

## Database Schema
- **users:** id, email, passwordHash, role, createdAt, business_id
- **businesses:** id, ownerId, name, logoUrl, services, availability
- **services:** id, businessId, name, pricePence, durationMin
- **bookings:** id, serviceId, clientName, datetime, status
- **notifications:** id, userId, title, message, type, read
- **short_links:** id, short_code, business_id, clicks
- **error_logs:** id, type, message, stack, resolved

## P0 - Next Priority Tasks
1. Stripe subscription integration (£4.99/month)
2. Wire onboarding wizard to backend
3. Push notifications (Expo)
4. Google Calendar sync

## P1 - Upcoming Tasks
- Automated booking reminders (cron/scheduled)
- CRM features (client history, notes)
- Multi-staff scheduling
- Customer reviews

## P2 - Future/Backlog
- Dojo payment integration (deferred)
- Admin super-dashboard
- SMS notifications (Twilio)
- Advanced analytics

## Founder Admin Panel
- [x] Overview tab with platform stats (users, businesses, bookings, errors)
- [x] Platform health monitoring (API status, DB connection, Email service)
- [x] Users management tab with search
- [x] Businesses management tab with search
- [x] Error Logs viewer
- **Access:** Any authenticated user with 'admin', 'founder', or 'business' role

## Known Issues
- None currently - all features tested and working (Iteration 5)

## Technical Stack
- **Frontend:** React, React Router, Tailwind CSS, Shadcn/UI
- **Mobile:** React Native, Expo, React Navigation
- **Backend:** FastAPI, MongoDB, Pydantic
- **Integrations:** OpenAI, Resend

## Recent Fixes (Iteration 5)
- Fixed API endpoint mismatch: Frontend was calling `/business/me` but backend had `/business`
- Fixed duplicate admin routes that blocked non-admin users from admin panel
- All 20 backend tests passing, all UI tests passing

## Last Updated
February 2026 - Iteration 5 Complete
