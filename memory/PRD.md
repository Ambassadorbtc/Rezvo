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
- **Animations:** `anim-fade-up`, `anim-scale-in`, `anim-slide-right` with stagger delays

## What's Been Implemented
- Full auth flow (signup, login, Google OAuth, forgot password)
- All dashboard pages redesigned with mobile-inspired colorful style
- Public booking page with QR code sharing
- Mobile app with feature parity
- Email action links (cancel/reschedule bookings)
- 5 Landing page test versions (`landingpage-test-{1-5}.html`)
- **Free Business Suite** (`/tools`) with 5 working tools:
  - QR Code Generator
  - Service Menu Generator
  - No-Show Reminder Templates
  - Pricing Calculator
  - Keyword Density Analyzer
- 3 pricing plans defined (Free, £8.99 Pro, £25 Business Coming Soon)

## Pricing Plans
- **Starter (Free):** 50 bookings/mo, 50 links, 400 reminders, 1 team member, basic analytics
- **Professional (£8.99/mo):** Unlimited bookings/links/reminders, 10 team, deposits, AI suggestions, priority support
- **Business (£25/mo - Coming Soon):** Multi-location, Google Calendar sync, Dojo payments, custom domain, white-label

## Free Tools Suite (Marketing Channel)
21 planned tools, 5 live. Hub at `/tools`. Each tool has:
- Upsell banner (top + mid-page + footer)
- SEO-optimized title/description
- No login required

## Pending / Backlog
- **P1:** Remaining 16 free tools (Phases 2-4)
- **P2:** Replace current landing page with chosen test version
- **P2:** Plans management in admin panel
- **P3:** Google Calendar Sync (needs user OAuth credentials)
- **P3:** Dojo Payment Integration
- **P3:** Mobile OnboardingWizard testing

## Test Accounts
- `demo@rezvo.com` / `demo123`
