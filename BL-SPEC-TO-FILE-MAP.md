# Rezvo — BL Spec-to-File Map
## What's built, what's a placeholder, what to extend

**For:** Bricklayer (Developer)  
**Last updated:** 22 February 2026  
**Use with:** Implementation order below

---

## Implementation Order (Recommended)

| Order | Run | Action | Blockers |
|-------|-----|--------|----------|
| 1 | **Run 5: Staff** | Build | None |
| 2 | **Run 7: Clients CRM** | Build | Needs Run 5 staff data |
| 3 | **Run 8: Analytics** | Extend | — |
| 4 | **Run 9: Payments** | Extend | — |
| 5 | **Run 10: Orders** | Build | Needs Run 4 menu ✅ |
| 6 | **Run 11: Floor Plan** | Extend | Restaurant-only |
| 7 | **Run 12: Marketing** | Build | Needs Run 7 CRM |
| 8 | **Run 14: Auth** | Extend | — |
| 9 | **Run 15: AI Assistant** | Build | Calls all APIs |
| 10 | **Run 16: Customer Ordering** | Build | Needs Run 10 |

**Skip Run 13 (Settings)** — Already implemented. Verify against spec and fill gaps.

---

## Run-by-Run File Map

### Run 1: Shell — ✅ BUILT
| What | Backend | Frontend |
|------|---------|----------|
| Dashboard layout | `dashboard.py` | `layouts/DashboardLayout.jsx` |
| Sidebar nav | — | `components/layout/Sidebar.jsx` |
| Top bar | — | `components/layout/TopBar.jsx` |
| Nav config | — | `config/navigation.js` |
| Tier gating | — | `contexts/BusinessContext.jsx`, `config/tiers.js` |
| Placeholder pages | — | `components/layout/PlaceholderPage.jsx` |

---

### Run 2: Money Flow / Booking — 🔨 IN PROGRESS
| What | Backend | Frontend |
|------|---------|----------|
| Public booking flow | `book.py` | `pages/booking/BookingFlow.jsx` |
| Create booking | `POST /book/:slug/create` | `utils/bookingApi.js` |
| Pick service | — | `pages/booking/steps/services/PickService.jsx` |
| Pick date/time | — | `pages/booking/steps/services/PickDateTime.jsx` |
| Your details | — | `pages/booking/steps/services/YourDetails.jsx` |
| Confirmation | — | `pages/booking/BookingConfirmation.jsx` |
| Manage/cancel | `GET/PUT/DELETE /book/:slug/booking/:id` | `pages/booking/BookingManage.jsx` |
| Stripe Connect | `payments.py` | Settings tab (Run 13) |
| Payment intent | `POST /payments/create-payment-intent` | — |

**Collections:** `bookings`, `clients` (via run7), `activity_log`

---

### Run 3: Daily Tools — ✅ BUILT
| What | Backend | Frontend |
|------|---------|----------|
| Dashboard summary | `GET /dashboard/business/:id/summary` | `pages/dashboard/Dashboard.jsx` |
| Today's bookings | `GET /dashboard/business/:id/today` | — |
| Activity feed | `GET /dashboard/business/:id/activity` | — |
| Bookings list | `GET /bookings/business/:id` | `pages/dashboard/Bookings.jsx` |
| Booking detail | `GET /bookings/business/:id/detail/:bid` | — |
| Status update | `PATCH /bookings/business/:id/:bid` | — |
| Calendar | `calendar.py`, `calendar_routes.py` | `pages/dashboard/Calendar.jsx` |

---

### Run 4: Services & Menu — ✅ BUILT
| What | Backend | Frontend |
|------|---------|----------|
| Services CRUD | `run4_services.py` | `pages/dashboard/Services.jsx` |
| Menu CRUD | `run4_menu.py` | Same Services page (restaurant mode) |
| Categories | Both | `business.menu`, `business.categories` |
| 86 toggle | `PATCH /menu/business/:id/:itemId/86` | — |
| **Gap for Run 16:** | Modifiers on menu items | Not implemented |

**Prefixes:** `/services-v2`, `/menu`

---

### Run 5: Staff — 🟡 PARTIAL (Backend done, frontend full)
| What | Backend | Frontend |
|------|---------|----------|
| Staff list | `run5_staff.py` | `pages/dashboard/Staff.jsx` |
| Create staff | `POST /staff-v2/business/:id` | — |
| Update staff | `PUT /staff-v2/business/:id/:sid` | — |
| Delete staff | `DELETE /staff-v2/business/:id/:sid` | — |
| Invite/reinvite | `POST .../reinvite` | — |
| Time off | `PUT .../time-off` | — |
| Working hours | In staff doc | — |

**Storage:** `business.staff[]` array. **Spec:** Full Run 5 spec. **Action:** Verify against spec, add gaps (invite emails, etc.).

---

### Run 6: Booking Editor — ✅ BUILT
| What | Backend | Frontend |
|------|---------|----------|
| Get/put booking page | `run6_booking_page.py` | `pages/dashboard/OnlineBooking.jsx` |
| Logo upload | `POST /booking-page/:id/logo` | — |
| Cover upload | `POST /booking-page/:id/cover` | — |
| QR code | `GET /booking-page/:id/qr` | — |
| Embed code | `GET /booking-page/:id/embed` | — |

**Storage:** `business.bookingPage` (branding, settings, integrations)

---

### Run 7: Clients CRM — ✅ BUILT
| What | Backend | Frontend |
|------|---------|----------|
| Client list | `run7_clients.py` | `pages/dashboard/Clients.jsx` |
| Client detail | `GET /clients-v2/business/:id/:cid` | — |
| Create/update | `POST`, `PUT` | — |
| Import/export | — | Check spec |
| Tags, notes | In client doc | — |
| Patch testing | In spec | Verify |

**Storage:** `clients` collection, `businessId`  
**Collections used:** `clients`, `bookings`

---

### Run 8: Analytics — 🟡 PARTIAL
| What | Backend | Frontend |
|------|---------|----------|
| Overview | `GET /analytics/business/:id/overview` | `pages/dashboard/Analytics.jsx` |
| Bookings by day | `GET /analytics/business/:id/bookings-by-day` | — |
| **Gap:** | Uses `db.reservations` (legacy) | Dashboard uses `db.bookings` |
| **Action:** | Align analytics to `bookings` collection | Extend charts per Run 8 spec |

---

### Run 9: Payments — 🔲 PLACEHOLDER
| What | Backend | Frontend |
|------|---------|----------|
| Stripe Connect | `payments.py` ✅ | Settings (Run 13) |
| Payment intent | `payments.py` ✅ | — |
| **Build:** | Transaction history, payouts, deposit mgmt | `pages/dashboard/Payments.jsx` (placeholder) |
| **Action:** | Extend `payments.py`, wire Payments page |

---

### Run 10: Orders — 🔲 PLACEHOLDER
| What | Backend | Frontend |
|------|---------|----------|
| **Build:** | `orders` collection, Orders API | `pages/dashboard/Orders.jsx` (placeholder) |
| Order board | — | — |
| Accept/reject | — | — |
| Prep timers | — | — |
| Uber Direct | — | — |
| **Depends on:** | Run 4 menu ✅ | — |

**Design:** `Run10-Orders-Board.html` (UXPilot exports)

---

### Run 11: Floor Plan — 🟡 PARTIAL
| What | Backend | Frontend |
|------|---------|----------|
| Floor plan fetch | `GET /tables/business/:id/floor-plan` | `pages/dashboard/FloorPlan.jsx` |
| **Gap:** | Basic tables API exists | Interactive editor not built |
| **Action:** | Build per Run 11 spec (editor, table status, QR codes) |
| **Scope:** | Restaurant-only (venue tier) |

---

### Run 12: Marketing — 🔲 PLACEHOLDER
| What | Backend | Frontend |
|------|---------|----------|
| **Build:** | Campaigns API, automations | `pages/dashboard/Marketing.jsx` (placeholder) |
| Reviews | `reviews.py` exists | `pages/dashboard/Reviews.jsx` |
| **Depends on:** | Run 7 clients | — |

**Design:** `Run12-Marketing.html`

---

### Run 13: Settings — ✅ BUILT (Verify)
| What | Backend | Frontend |
|------|---------|----------|
| Full settings | `run13_settings.py` | `pages/dashboard/Settings.jsx` |
| Business details | `GET/PUT /settings-v2/business/:id` | Tab 1 |
| Opening hours | `PUT .../hours`, `POST .../special-hours` | Tab 2 |
| Notifications | `PUT .../notifications` | Tab 3 |
| Integrations | Stripe connect/disconnect | Tab 4 |
| Subscription | `GET/POST /settings-v2/subscription/:id` | Tab 5 |
| Team summary | — | Tab 6 (links to Staff) |
| Export/Delete | `GET .../export`, `DELETE ...` | Danger zone |

**Action:** Compare against Run 13 spec, fill any gaps.

---

### Run 14: Auth — 🟡 PARTIAL
| What | Backend | Frontend |
|------|---------|----------|
| Login | `auth.py` ✅ | `pages/auth/Login.jsx`, `LoginPage.jsx` |
| Register | `auth.py` ✅ | `Register.jsx`, `SignupPage.jsx` |
| Password reset | `auth.py` (stub) | No forgot/reset pages |
| Users me | `users.py` | AuthContext |
| **Build:** | Signup with business+staff, verify email, refresh token | Forgot/reset pages |
| **Build:** | RBAC middleware (manager, readonly) | Role-based nav |
| **Build:** | Accept invite | `/accept-invite` page |
| **Build:** | Rate limiting | — |

**Routes:** `/auth/login`, `/auth/register`, `/auth/password-reset-request`, `/auth/password-reset-confirm`

---

### Run 15: AI Assistant — 🔲 NOT STARTED
| What | Backend | Frontend |
|------|---------|----------|
| **Build:** | `POST /ai/:businessId/chat` | Chat panel component |
| **Build:** | `conversations` collection | Floating button, slide panel |
| **Build:** | Function calling (get_schedule, create_booking, etc.) | Action cards, suggestions |
| **Build:** | System prompt, model (Claude or Grok) | Typing indicator |
| **Reference:** | `voice_search.py` (Anthropic), `RezvoSupportBot.jsx` | — |

**No routes or pages exist.** Depends on all booking/client/service APIs.

---

### Run 16: Customer Ordering — 🔲 NOT STARTED
| What | Backend | Frontend |
|------|---------|----------|
| **Build:** | `GET /order/:slug` | `/order/:slug` page |
| **Build:** | `POST /order/:slug/validate-delivery` | Order type selector |
| **Build:** | `POST /order/:slug/validate-promo` | Basket, checkout |
| **Build:** | `POST /order/:slug/place` | Stripe Elements |
| **Build:** | `GET /order/:slug/track/:orderId` | Track page |
| **Depends on:** | Run 10 orders board, Run 4 menu (add modifiers) | — |
| **Run 4 gap:** | Add `modifiers` to menu items | — |
| **Business gap:** | Add `ordering` config | — |

**No routes exist.** First use: Burg Burgers, Nottingham.

---

## Quick Reference: API Prefixes

| Prefix | Router | Run |
|--------|--------|-----|
| `/auth` | auth.py | 14 |
| `/book` | book.py | 2 |
| `/booking-page` | run6_booking_page.py | 6 |
| `/bookings` | bookings.py | 3 |
| `/businesses` | businesses.py | Core |
| `/dashboard` | dashboard.py | 3 |
| `/menu` | run4_menu.py | 4 |
| `/payments` | payments.py | 2, 9 |
| `/settings` | settings.py | Legacy |
| `/settings-v2` | run13_settings.py | 13 |
| `/services-v2` | run4_services.py | 4 |
| `/staff` | staff.py | Legacy |
| `/staff-v2` | run5_staff.py | 5 |
| `/clients-v2` | run7_clients.py | 7 |
| `/analytics` | analytics.py | 8 |
| `/tables` | tables.py | 11 |
| `/users` | users.py | Auth |
| `/api/voice-search` | voice_search.py | Voice search |
| `/api/support` | support.py | Support bot |

---

## Collections Summary

| Collection | Used by | Notes |
|------------|---------|------|
| `businesses` | All | Core entity |
| `users` | Auth, Tier | |
| `bookings` | Run 2, 3, 5, 7 | Main booking data (Run 2 format) |
| `reservations` | analytics.py, bookings.py (legacy) | Legacy — migrate analytics to bookings |
| `clients` | Run 7, book.py | businessId, customerId |
| `activity_log` | Run 2, 3 | businessId |
| `support_conversations` | Support bot | |
| `orders` | — | **Create for Run 10/16** |
| `conversations` | — | **Create for Run 15** |

---

## Frontend Route Map

| Path | Page | Run |
|------|------|-----|
| `/dashboard` | Dashboard.jsx | 3 |
| `/dashboard/bookings` | Bookings.jsx | 3 |
| `/dashboard/calendar` | Calendar.jsx | 3 |
| `/dashboard/services` | Services.jsx | 4 |
| `/dashboard/staff` | Staff.jsx | 5 |
| `/dashboard/online-booking` | OnlineBooking.jsx | 6 |
| `/dashboard/clients` | Clients.jsx | 7 |
| `/dashboard/analytics` | Analytics.jsx | 8 |
| `/dashboard/payments` | Payments.jsx | 9 placeholder |
| `/dashboard/orders` | Orders.jsx | 10 placeholder |
| `/dashboard/floor-plan` | FloorPlan.jsx | 11 partial |
| `/dashboard/marketing` | Marketing.jsx | 12 placeholder |
| `/dashboard/settings` | Settings.jsx | 13 |
| `/book/:slug` | BookingFlow.jsx | 2 |
| `/book/:slug/confirm/:id` | BookingConfirmation.jsx | 2 |
| `/book/:slug/manage/:id` | BookingManage.jsx | 2 |
| `/login`, `/auth/login` | LoginPage, Login | 14 |
| `/signup`, `/auth/register` | SignupPage, Register | 14 |
| **Not yet:** `/order/:slug` | — | 16 |
| **Not yet:** `/order/:slug/track/:id` | — | 16 |
| **Not yet:** `/forgot-password`, `/reset-password` | — | 14 |
| **Not yet:** `/accept-invite` | — | 14 |

---

*Use this map with the implementation order to know what to build next and where it lives.*
