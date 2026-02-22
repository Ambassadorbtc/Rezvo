# Bricklayer — Tomorrow's Demo: Skin to UXPilot Designs

## Context

The **functionality is there**. Look at the sidebar: Calendar, Bookings, Booking Link, Services, Staff, Online Booking, Clients, Reviews, Analytics, Payments, Marketing. Twelve pages wired up — a week ago there were four.

**The problem:** BL built logic without design. Features were coded but not skinned to match the UXPilot designs.

**That's fixable — and fast.** It's a styling pass, not a rebuild.

---

## Design Spec Locations

Every page needs to match the UXPilot designs. The HTML files **are** the design spec.

```
Dashboard:      C:\Users\HP Elitebook\Downloads\uxpilot-export-Web Portal Design
Customer:       C:\Users\HP Elitebook\Downloads\uxpilot-export-Customer Design Pages
New dashboard:  C:\Users\HP Elitebook\Downloads\uxpilot-export-1771773108598
```

---

## Demo Priorities (Tomorrow)

### 1. Dashboard
Match `1-Brand Design.html`
- KPI cards
- Activity feed
- Quick actions styled

### 2. Calendar
Match `2-Brand Design.html`
- Day/week view
- Staff columns
- Colour-coded events

### 3. Services
Match `3-Brand Design.html`
- Service cards with duration, price, staff

### 4. Fix the Loading Spinner
The dashboard was stuck on "Loading...". Two causes (one already fixed):

**A) API error** — If still loading, check the browser console (F12 → Console tab) for red errors. Probably the dashboard stats endpoint is failing.

**B) business.id mismatch** — ✅ Fixed. Dashboard now uses `useBusiness()`, handles `business?.id ?? business?._id`, and calls `setLoading(false)` even when the fetch is skipped.

---

## Summary

The bones are solid. It just needs the skin.
