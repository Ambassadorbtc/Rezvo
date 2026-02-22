# BL Instructions — Priority Order
**For:** Bricklayer  
**Updated:** 22 February 2026

---

## 1. Deploy what's built

Push current code to production. Site should be live at https://rezvo.co.uk.

---

## 2. Collection naming — FIXED ✅

**Problem:** `reservations` vs `bookings` — two collections, inconsistent use across routes. Run 8 Analytics was querying `reservations`, which doesn't receive data from the Run 2 booking flow (which writes to `bookings`). That's a ticking time bomb.

**Standard:** Use `bookings` everywhere. It's the Run 2 format:
- `businessId` (not business_id)
- `date` as string YYYY-MM-DD
- `time` as string HH:MM
- `customer` (name, email, phone)
- `service` (name, duration, price)
- `status`, `reference`, etc.

**Changes made:**
- `analytics.py` — all queries switched from `reservations` → `bookings`
- `users.py` `/me/bookings` — now queries `bookings` by customer email
- `bookings.py` `/business/:id/calendar` — now queries `bookings`

**Remaining:** The legacy `POST /bookings/`, `GET /bookings/{id}`, `PATCH /bookings/{id}` still use `reservations`. Consider deprecating or migrating those once the Run 2 flow is the only entry point.

---

## 3. Run 5 (Staff) — Next build

Spec ready. Designs ready. No blockers. **Crack on with Run 5.** Everything else flows from there:
- Run 7 (Clients) needs staff for assignments
- Run 12 (Marketing) needs CRM data from Run 7
- Run 10 (Orders) can proceed in parallel (needs menu ✅)

---

## Modifiers (Run 4) — Not urgent

The modifiers gap on menu items only matters for Run 16 (Customer Ordering). You've got time. Add when Run 16 is in scope.

---

## Implementation order reference

See `BL-SPEC-TO-FILE-MAP.md` for full spec-to-file mapping and run-by-run status.
