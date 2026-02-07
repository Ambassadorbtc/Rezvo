# Rezvo App - Product Requirements Document

## Overview
Rezvo is a booking application for UK micro-businesses. Web-first responsive platform + native mobile app (Expo).

## Core Features
- Business owner auth (email/password + Google OAuth)
- Public booking page with shareable links
- Calendar with drag-and-drop (web) and long-press-to-move (mobile)
- Services & Products management
- Team management with calendar colors
- Analytics dashboard
- Two-way support messaging
- Notification center
- Business settings (hours, booking rules, reminders)
- Email system (booking confirmations, cancel/reschedule links)
- Forgot password flow

## Architecture
- **Backend:** FastAPI + MongoDB (`/app/backend/server.py`)
- **Frontend:** React + Tailwind + Shadcn/UI (`/app/frontend/`)
- **Mobile:** React Native / Expo (`/app/mobile/rezvo-mobile/`)

## Design System (Updated Feb 2026)
- **Background:** Cream `#FDFBF7`
- **Primary:** Teal `#00BFA5`
- **Stat card palettes:** `#E8F5F3` (teal), `#FEF3E2` (amber), `#EDE9FE` (purple), `#DBEAFE` (blue), `#D1FAE5` (emerald), `#FEE2E2` (red)
- **Corners:** `rounded-2xl` throughout
- **Animations:** `anim-fade-up`, `anim-scale-in`, `anim-slide-right` with stagger delays `anim-d1` through `anim-d8`
- **Hover:** Scale + shadow transitions on cards

## What's Been Implemented
- Full auth flow (signup, login, Google OAuth, forgot password)
- Dashboard, Calendar, Bookings, Services, Products, Team, Analytics, Settings, Support pages
- Public booking page with QR code sharing
- Mobile app with feature parity (onboarding wizard, calendar, products, share link)
- Email action links (cancel/reschedule bookings)
- Showcase page (`/showcase.html`)
- **UI Redesign (Feb 7 2026):** All web pages updated to match mobile's colorful, rounded design with entrance animations

## Pending / Backlog
- **P3:** Google Calendar Sync (implemented, needs user OAuth credentials)
- **P3:** Dojo Payment Integration
- **P2:** Mobile OnboardingWizard testing
- **P2:** Showcase page user verification

## Test Accounts
- `demo@rezvo.com` / `demo123`

## Expo Mobile
- Tunnel URL changes on each pod restart
- QR page at `/expo-qr.html`
