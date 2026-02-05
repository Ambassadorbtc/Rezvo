# Rezvo Booking App - Product Requirements Document

## Overview
A booking application MVP for UK micro-businesses, providing a web-first responsive platform and a native mobile app for both clients and businesses. Design inspired by challenger banks like Monzo with a modern, clean aesthetic.

## Core Information
- **App Name:** Rezvo
- **Target Market:** UK micro-businesses
- **Monetization:** £4.99/month subscription (deferred)
- **Design Theme:** Light theme with teal accents (#00BFA5)
- **Fonts:** Space Grotesk, Plus Jakarta Sans

## Application URLs
| Page | URL |
|------|-----|
| Landing Page | https://timeslot-pro-3.preview.emergentagent.com |
| Login | https://timeslot-pro-3.preview.emergentagent.com/login |
| Dashboard | https://timeslot-pro-3.preview.emergentagent.com/dashboard |
| Calendar | https://timeslot-pro-3.preview.emergentagent.com/calendar |
| Team | https://timeslot-pro-3.preview.emergentagent.com/team |
| Services | https://timeslot-pro-3.preview.emergentagent.com/services |
| Products | https://timeslot-pro-3.preview.emergentagent.com/products |
| Bookings | https://timeslot-pro-3.preview.emergentagent.com/bookings |
| Settings | https://timeslot-pro-3.preview.emergentagent.com/settings |
| Analytics | https://timeslot-pro-3.preview.emergentagent.com/analytics |
| Support | https://timeslot-pro-3.preview.emergentagent.com/support |
| Founder Admin | https://timeslot-pro-3.preview.emergentagent.com/admin |
| Booking Page Settings | https://timeslot-pro-3.preview.emergentagent.com/booking-page |
| Public Booking | https://timeslot-pro-3.preview.emergentagent.com/book/{businessId} |
| Expo QR Code | https://timeslot-pro-3.preview.emergentagent.com/expo-qr.html |
| Expo Web Preview | https://timeslot-pro-3.preview.emergentagent.com/expo/ |

### Test Credentials
- **Business Owner:** testuser@example.com / password123
- **Founder Admin:** founder@rezvo.app / Founder123!
- **Business ID:** 3edbbbc1-730a-494e-9626-1a0a5e6309ef

---

## Implemented Features (as of Feb 5, 2026)

### Core Platform Features
- ✅ JWT-based user authentication
- ✅ Business onboarding wizard
- ✅ Dashboard with analytics
- ✅ Team member management with avatars and colors
- ✅ Services CRUD with pricing and durations
- ✅ **Products CRUD** with inventory tracking
- ✅ Booking management with status updates
- ✅ Calendar with Day/Week/Month views
- ✅ **Calendar drag-and-drop** (between days and time slots)
- ✅ Analytics page with charts
- ✅ Settings page
- ✅ Legal pages (Privacy, Terms, Cookies)
- ✅ Cookie consent popup

### Booking System
- ✅ Public booking page with shareable link
- ✅ **Compact booking modal** - scrollable with fixed Continue button (Feb 5)
- ✅ **Month calendar navigation** for date selection
- ✅ **Time period filters** (Morning/Afternoon/Evening)
- ✅ **Time slots up to 9pm**
- ✅ Multi-service selection with totals
- ✅ Team member/professional selection
- ✅ Booking confirmation emails (via Resend)

### Calendar - Premium Fresha-style Design (Feb 5)
- ✅ **Colored top bar** on booking cards (service color)
- ✅ **Team member avatar and name** on booking cards
- ✅ **Client name, service name, price** properly displayed
- ✅ **No text cutoff** - responsive card heights
- ✅ Day view with team member columns
- ✅ Week view with draggable booking cards

### Support & Messaging
- ✅ Support chat page with emoji picker
- ✅ **In-page message editing** (no popups)
- ✅ **File attachment buttons**
- ✅ Message copy, reply, delete actions
- ✅ **Admin Support Inbox** in Founder Panel
- ✅ Conversation threading with timestamps
- ✅ Unread message badges
- ✅ **Fixed Chat Alignment** (Feb 5) - Owner view: own messages RIGHT/TEAL, founder messages LEFT/BLUE
- ✅ **Teal Status Dropdown** (Feb 5) - Unified teal background for status selector in both portals

### Admin/Founder Panel
- ✅ User management dashboard
- ✅ Business analytics
- ✅ Error logs viewer
- ✅ **Fixed Chat Alignment** (Feb 5) - Founder view: own messages RIGHT/BLUE, owner messages LEFT/TEAL
- ✅ **Emoji and attachment buttons** in reply input
- ✅ User avatars on messages
- ✅ Reply to support conversations
- ✅ **Teal Status Dropdown** (Feb 5) - Modern dropdown replacing conditional buttons

### UI/UX Improvements
- ✅ **Branded delete confirmation dialogs** (replacing native confirm())
- ✅ Toast notifications via Sonner
- ✅ Modern card-based layouts
- ✅ Responsive design for mobile/tablet/desktop
- ✅ Global search functionality

### Mobile App (Expo)
- ✅ React Native / Expo SDK 54
- ✅ Business owner screens (Dashboard, Calendar, Bookings, Services, Settings)
- ✅ **Redesigned week view** (Feb 5) - Card-based layout per day with booking summaries
- ✅ **Premium booking cards** with colored top bar, team member avatar/name
- ✅ **Branded Toast Notifications** (Feb 5) - All 40 Alert.alert calls replaced with branded toast
- ✅ Client screens (UI mockups)
- ✅ Push notification setup (pending integration)
- ✅ Photo upload for profile

### Notifications System (Feb 5)
- ✅ **Notification Bell** - Functional dropdown with unread count badge
- ✅ **Notification API** - GET /api/notifications, PATCH read/read-all
- ✅ **Auto-notification on Booking** - Business owner receives notification when new booking created
- ✅ **Auto-notification on Support Message** - Users notified of new messages
- ✅ **Mark All Read** functionality

### File Upload System (Feb 5)
- ✅ **Support File Upload** - POST /api/support/upload endpoint
- ✅ **File Types:** .jpg, .jpeg, .png, .gif, .pdf, .doc, .docx, .txt
- ✅ **Max Size:** 5MB per file
- ✅ **File Download** - GET /api/support/files/{file_id}

---

## Pending/In Progress Items

### P1 - High Priority
- ⏳ **Mobile drag-and-drop for calendar** - Not yet implemented
- ⏳ **Client mobile app API integration** - Screens exist but not connected to backend
- ⏳ Google Calendar Sync - Backend endpoints exist, needs frontend integration
- ⏳ Push Notifications - Expo setup done, needs implementation
- ⏳ Automated Booking Reminders - APScheduler installed, needs job implementation

### P2 - Medium Priority
- ⏳ Staff Separate Logins
- ⏳ Customer Reviews & Ratings
- ⏳ Multi-location Support
- ⏳ Advanced Team Scheduling (shifts, time off)
- ⏳ SMS Notifications (Twilio) - User deferred

### P3 - Lower Priority / Future
- ⏳ Stripe Subscription (£4.99/month) - User deferred
- ⏳ Re-enable babel-metadata-plugin (disabled due to conflicts)

---

## Technical Architecture

### Backend
- **Framework:** FastAPI
- **Database:** MongoDB
- **Auth:** JWT tokens
- **Scheduler:** APScheduler
- **Email:** Resend API

### Frontend (Web)
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Charts:** Recharts
- **Build Tool:** Craco

### Mobile
- **Framework:** React Native / Expo SDK 54
- **Navigation:** React Navigation
- **State:** Context API

### Key Files
```
/app/
├── backend/
│   └── server.py              # Main FastAPI application
├── frontend/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Page components
│       └── lib/api.js         # API client
└── mobile/
    └── rezvo-mobile/
        └── src/
            ├── screens/       # Screen components
            └── navigation/    # Navigation setup
```

---

## Known Issues

1. **babel-metadata-plugin disabled** - Conflicts with complex JSX components
2. **Mobile native alerts** - Some screens still use Alert.alert() instead of branded components
3. **Client mobile flow** - UI mockups only, no API integration

---

## API Endpoints Summary

### Auth
- POST /api/auth/login
- POST /api/auth/signup

### Business
- GET/PATCH /api/business
- POST /api/business/logo

### Services
- GET/POST/PATCH/DELETE /api/services

### Products
- GET/POST/PATCH/DELETE /api/products

### Bookings
- GET/POST/PATCH /api/bookings
- POST /api/public/bookings

### Team
- GET/POST/PATCH/DELETE /api/team-members

### Support/Messaging
- GET/POST /api/conversations
- GET/POST /api/conversations/{id}/messages
- PATCH/DELETE /api/messages/{id}
- GET /api/admin/conversations

### Analytics
- GET /api/admin/stats
- GET /api/admin/analytics
