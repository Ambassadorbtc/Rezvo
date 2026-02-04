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

## Founder Admin Panel (TailAdmin-style design)
- [x] **Dashboard Tab:** Stats cards (Users, Businesses, Bookings, Revenue), Weekly bar chart, Status breakdown, Top Services chart, Platform Health
- [x] **Users Tab:** Searchable table with pagination, role badges, status indicators, view actions
- [x] **Businesses Tab:** Card grid layout with search, logo/avatar, tagline, status, view actions
- [x] **Bookings Tab:** Table view of all platform bookings with client, service, date, amount, status
- [x] **Error Logs Tab:** Error list with severity, timestamp, stack trace viewer, resolve action
- [x] Analytics API endpoint `/api/admin/analytics` with daily data, status breakdown, top services
- [x] Clean sidebar navigation with teal accent, light theme

## Search Feature
- [x] Backend search endpoint `/api/search` - searches bookings, services, and customers
- [ ] Frontend search modal (temporarily disabled due to Babel plugin conflict)

## Known Issues
- SearchModal component causes Babel visual-edits plugin recursion error - temporarily disabled

## Technical Stack
- **Frontend:** React, React Router, Tailwind CSS, Shadcn/UI
- **Mobile:** React Native, Expo, React Navigation
- **Backend:** FastAPI, MongoDB, Pydantic
- **Integrations:** OpenAI, Resend

## Recent Fixes (Iteration 7)
- Added analytics charts to Admin Panel (using custom CSS charts instead of Recharts due to Babel plugin conflict)
- Added `/api/admin/analytics` endpoint with daily stats, status breakdown, top services
- Added `/api/search` backend endpoint for global search
- Fixed duplicate import error in FounderAdminPage

## Last Updated
February 2026 - Iteration 7 Complete
