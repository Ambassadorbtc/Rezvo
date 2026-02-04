# Rezvo.app - Product Requirements Document

## Overview
Rezvo is a £4.99/month booking tool for UK micro-businesses. Target: mobile hairdressers, food trucks, nail techs, personal trainers, dog groomers, driving instructors.

**Core Promise:** Generate a shareable booking link in 12 seconds.
**App Name:** rezvo.app

---

## What's Been Implemented

### Date: 2026-02-04 (Session 2)

**✅ Completed This Session:**

1. **Monzo/Starling Fonts**
   - Space Grotesk for headlines
   - Plus Jakarta Sans for body/UI

2. **Session Persistence Bug Fixed**
   - Renamed localStorage keys to `rezvo_token` / `rezvo_user`
   - Immediate state rehydration

3. **React Native Mobile App** (`/app/mobile/rezvo-mobile`)
   - Dual-mode: Client App + Business App
   - 11 screens total (6 client, 5 business)
   - Teal (#00BFA5) theme matching web
   - Bottom tab navigation

4. **Mobile App Web Preview** (`/mobile-preview`)
   - Interactive preview in browser
   - Toggle between Client/Business modes
   - Navigate all screens

5. **Email Notifications (Resend Integration)**
   - Booking confirmation emails (auto-sent)
   - Reminder emails (24hr before)
   - Professional HTML templates with Rezvo branding
   - Non-blocking async sending

6. **AI-Powered Features (OpenAI GPT-4o-mini)**
   - `/api/ai/suggest-slots` - Smart slot recommendations
   - `/api/ai/chat` - Business assistant chatbot
   - Uses Emergent LLM Key

---

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Business & Services
- `POST /api/business` - Create business
- `GET /api/business/{id}` - Get business
- `CRUD /api/services` - Manage services

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/public/bookings` - Create public booking (auto-sends email)
- `PATCH /api/bookings/{id}/status` - Update status

### Notifications
- `POST /api/notifications/send-confirmation` - Manual confirmation
- `POST /api/notifications/send-reminder` - Send reminder
- `POST /api/notifications/test-email` - Test email config

### AI Features
- `POST /api/ai/suggest-slots` - Get smart slot suggestions
- `POST /api/ai/chat` - Chat with AI assistant

### Share & Analytics
- `GET /api/links/generate` - Get shareable link
- `GET /api/analytics` - Dashboard stats

---

## Technical Stack

**Backend:** FastAPI, MongoDB, JWT Auth, Resend (email), OpenAI GPT-4o-mini
**Web Frontend:** React, Tailwind CSS, shadcn/ui, Recharts
**Mobile:** React Native + Expo (at `/app/mobile/rezvo-mobile`)
**Fonts:** Space Grotesk, Plus Jakarta Sans

---

## Test Credentials
```
Email: testuser@example.com
Password: password123
```

---

## Remaining Work (Deferred)

### P1 - Important
- [ ] Dojo payment integration (user deferred)
- [ ] Push notifications for mobile (Expo Push)
- [ ] Google Calendar sync
- [ ] Stripe subscription billing (£4.99/mo)

### P2 - Nice to Have
- [ ] Native mobile app deployment (App Store/Play Store)
- [ ] Multi-staff scheduling
- [ ] Customer reviews/ratings
- [ ] SMS notifications (Twilio)

---

## URLs
- **Web App:** https://quick-slot-1.preview.emergentagent.com
- **Mobile Preview:** https://quick-slot-1.preview.emergentagent.com/mobile-preview
- **Public Booking:** https://quick-slot-1.preview.emergentagent.com/book/{business_id}

---

*Last Updated: 2026-02-04*
*Version: 1.2.0 (Mobile App + Email + AI)*
