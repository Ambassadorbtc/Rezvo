# Rezvo.app - Product Requirements Document

## Overview
QuickSlot is a £4.99/month booking tool for UK micro-businesses who can't stomach £40+ schedulers like Booksy. Target: mobile hairdressers, food trucks, nail techs, personal trainers, dog groomers, driving instructors.

**Core Promise:** Generate a shareable booking link in 12 seconds.

---

## User Personas

### Primary Persona: Solo Service Provider
- **Name:** Sarah, 28, Mobile Hairdresser in Manchester
- **Pain Points:** Expensive booking tools (Booksy £40/mo), manual appointment scheduling via WhatsApp, frequent no-shows
- **Goals:** Simple booking system, shareable links for social media, deposit collection to reduce no-shows
- **Tech Savvy:** Uses TikTok/Instagram daily, comfortable with apps

### Secondary Persona: Small Business Owner
- **Name:** James, 35, Personal Trainer in London
- **Pain Points:** Juggling multiple clients, tracking revenue, managing availability
- **Goals:** Professional booking page, analytics dashboard, automated reminders

---

## Core Requirements (Static)

### Must Have (P0)
1. ✅ User authentication (signup/login with JWT)
2. ✅ Business profile setup
3. ✅ Services management (CRUD with pricing, duration, deposits)
4. ✅ Availability management (weekly schedule)
5. ✅ Shareable booking links with QR codes
6. ✅ Public booking page for clients
7. ✅ Bookings management (view, cancel)
8. ✅ Dashboard with key metrics
9. ✅ Calendar view (week/month)
10. ✅ Mobile-responsive design (PWA-style)

### Should Have (P1)
1. ✅ Analytics with charts (revenue, bookings by service)
2. ✅ AI-powered suggestions (via Emergent LLM)
3. ✅ Onboarding wizard (4 steps)
4. ⏳ Dojo payment integration (code complete, needs API key)
5. ⏳ Email reminders (Resend integration ready)

### Could Have (P2)
1. ⏳ SMS reminders (Twilio - structure ready)
2. ⏳ Admin dashboard for platform management
3. ⏳ Multi-location support
4. ⏳ Staff management

---

## What's Been Implemented

### Date: 2026-02-04

**Backend (FastAPI + MongoDB)**
- Complete authentication system (JWT, 14-day expiry, bcrypt hashing)
- Business CRUD operations
- Services CRUD with deposits
- Bookings management
- Public booking endpoints
- Shareable link generation
- Analytics endpoints (dashboard, revenue, services)
- AI suggestions via Emergent LLM
- Dojo payment integration (hosted checkout flow)
- Onboarding completion tracking
- Settings management

**Frontend (React + Tailwind + shadcn/ui)**
- Landing page with bold Monzo-style design
- Signup/Login pages
- Onboarding wizard (4 steps)
- Dashboard with Bento Grid layout
- Calendar view (week/month toggle)
- Bookings list with filtering
- Services management
- Share Link page with QR code
- Settings page (profile, payments, reminders)
- Analytics page with Recharts
- Public booking page for clients
- Mobile-responsive with bottom nav
- Dark mode theme (Obsidian + Blaze Orange)

**Design System**
- Custom Tailwind config with QuickSlot colors
- Inter font family
- Pill-shaped buttons
- Glassmorphism effects
- Card hover animations
- Noise texture overlay

---

## Prioritized Backlog

### P0 - Critical (Next Sprint)
1. [ ] Connect Dojo payment API key for live deposits
2. [ ] Set up Resend for email confirmations/reminders
3. [ ] Add booking reschedule functionality
4. [ ] Implement date blocking for holidays

### P1 - Important
1. [ ] Add client management (CRM)
2. [ ] Implement booking confirmation emails
3. [ ] Add Google Calendar sync
4. [ ] Create promotional landing pages

### P2 - Nice to Have
1. [ ] Native mobile apps (iOS/Android)
2. [ ] Multi-staff scheduling
3. [ ] Customer reviews/ratings
4. [ ] Waitlist for full slots
5. [ ] Gift vouchers
6. [ ] Stripe billing for subscriptions

---

## Technical Architecture

```
Frontend: React 18 + Tailwind CSS + shadcn/ui
Backend: FastAPI (Python)
Database: MongoDB
Auth: JWT (14-day expiry)
Payments: Dojo (UK) - hosted checkout
AI: OpenAI GPT-4o-mini via Emergent
Hosting: Emergent.sh
```

---

## Success Metrics

- **North Star:** Monthly Active Businesses
- **Key Metrics:**
  - Signups/week
  - Bookings created/week
  - Revenue per user (avg)
  - No-show rate (target: <5%)
  - Link shares (virality)

---

## Next Tasks List

1. **Immediate:**
   - Test complete booking flow end-to-end
   - Add Dojo API key and test payment flow
   - Set up email notifications via Resend

2. **This Week:**
   - Add booking reschedule feature
   - Implement date blocking
   - Add client notes to bookings

3. **Next Week:**
   - Build client CRM view
   - Add referral program
   - Create onboarding video/tutorial

---

*Last Updated: 2026-02-04*
*Version: 1.0.0 MVP*
