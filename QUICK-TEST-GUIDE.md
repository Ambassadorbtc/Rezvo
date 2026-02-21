# Quick Test Guide — Rezvo Directory Pages

**Status:** ✅ ALL PHASE 1 PAGES DEPLOYED AND LIVE  
**Live URL:** http://rezvo.co.uk/

---

## 🧪 Test Checklist

Open your browser and test these URLs:

### 1. Homepage (Directory Landing)
**URL:** http://rezvo.co.uk/

**What to check:**
- [ ] Hero section loads with "Discover & Book Local Favourites" heading
- [ ] Search bar has 4 fields (Date, Time, Party Size, Search)
- [ ] "Browse by Category" carousel shows 7 categories with images
- [ ] "Trending Near You" grid shows restaurant cards
- [ ] Some cards have green "BOOK NOW" badge with time slots
- [ ] Some cards have "NOT YET ON REZVO" badge with "Notify Me" button
- [ ] "Browse by City" grid shows 12 UK cities
- [ ] FAQ accordion expands/collapses
- [ ] Business owner CTA section at bottom
- [ ] Footer has 4 columns with links

### 2. Search Results
**URL:** http://rezvo.co.uk/search

**What to check:**
- [ ] Compact search bar appears at top (sticky)
- [ ] Left sidebar shows filters (Sort By, Cuisine, Price Range, Rating, Distance, Availability)
- [ ] Restaurant grid shows search results
- [ ] "Map View" button appears (UI only, map not integrated yet)
- [ ] On mobile: "Filters" button appears to toggle sidebar
- [ ] Time slot pills on restaurant cards are clickable

### 3. Restaurant Detail
**URL:** http://rezvo.co.uk/restaurant/[any-slug]

**What to check:**
- [ ] Hero image with restaurant name overlay
- [ ] Rating badge in top-right of hero
- [ ] Save (heart) and Share buttons work
- [ ] Breadcrumb navigation shows Home > City > Restaurant
- [ ] Sticky booking widget with date/time/guests selector
- [ ] Available time slots as clickable pills
- [ ] About section with description
- [ ] Highlights grid (if data provided)
- [ ] Photos gallery
- [ ] Reviews section (if data provided)
- [ ] Sidebar "Quick Info" card with hours, address, contact
- [ ] "Similar Venues Nearby" section at bottom

### 4. Login
**URL:** http://rezvo.co.uk/login

**What to check:**
- [ ] Email and password fields
- [ ] "Remember me" checkbox
- [ ] "Forgot password?" link
- [ ] Password visibility toggle (eye icon)
- [ ] "Log In" button
- [ ] Google and Apple auth buttons (placeholders)
- [ ] "Don't have an account? Get Started Free" link
- [ ] "Are you a business owner? Claim your listing" link

### 5. Signup
**URL:** http://rezvo.co.uk/signup

**What to check:**
- [ ] Full name, email, password, business type fields
- [ ] Password strength hint ("Must be at least 8 characters...")
- [ ] Business type dropdown (Restaurant, Salon, Barber, Spa, Café, Bar/Pub)
- [ ] Terms & privacy checkbox
- [ ] "Create Account" button
- [ ] Google and Apple auth buttons
- [ ] Benefits panel "Why business owners choose Rezvo"
- [ ] "Already have an account? Log In" link

### 6. FAQs
**URL:** http://rezvo.co.uk/faqs

**What to check:**
- [ ] Page loads with "Frequently Asked Questions" heading
- [ ] 6 FAQ items in accordion
- [ ] First FAQ is open by default
- [ ] Clicking other FAQs expands them and collapses others
- [ ] "Still have questions?" section at bottom with support email CTA

---

## 🎨 Visual Quality Checklist

### Brand Consistency
- [ ] All headings use Bricolage Grotesque (thick, bold, British Racing Green)
- [ ] Body text uses Figtree (clean, readable)
- [ ] Primary green (`#1B4332`) used for buttons, nav, headings
- [ ] Mint (`#52B788`) used for accents, badges, hover states
- [ ] Cream (`#FAFAF7`) background on alternating sections
- [ ] Cards have rounded corners (16-20px) with subtle shadows

### Interactions
- [ ] Navbar becomes white with shadow on scroll
- [ ] Restaurant cards have hover effects (shadow grows, image scales)
- [ ] Category cards lift on hover (-translate-y-2)
- [ ] City cards show mint border on hover
- [ ] Time slot pills change colour on hover (mint background)
- [ ] All buttons have smooth transitions

### Mobile Responsive
- [ ] Navbar shows hamburger menu on mobile
- [ ] Search bar fields stack vertically on mobile
- [ ] Restaurant grid goes to 1 column on mobile
- [ ] Category carousel scrolls horizontally on mobile
- [ ] City grid goes to 2 columns on mobile
- [ ] FAQ accordion works on mobile
- [ ] Footer columns stack on mobile

---

## 🐛 Known Limitations (To Fix in Phase 2)

1. **No Real Data Yet:** Pages will show empty states or loading skeletons until backend endpoints return real data from MongoDB

2. **Backend Endpoints Need Testing:**
   - `GET /directory/home` — should return trending listings
   - `GET /directory/search` — should return filtered listings
   - `GET /directory/listings/{slug}` — should return full listing detail
   - `POST /directory/notify-me/{listing_id}` — should capture email

3. **Map View:** UI button exists but map integration (Google Maps/Mapbox) not implemented yet

4. **Photo Gallery:** "View All Photos" button not functional yet (needs lightbox modal)

5. **Booking Flow:** Time slot pills navigate to listing page but don't complete booking yet

6. **Social Auth:** Google and Apple buttons are placeholders (OAuth not integrated)

---

## 🚀 Quick Fix Command (If Something Breaks)

If you need to rebuild and redeploy:

```bash
# On your local machine:
cd c:\Users\HP Elitebook\Desktop\Cursor\Rezvo\frontend
npm run build

# On the server:
ssh -i "C:\Users\HP Elitebook\.ssh\rezvo_rsa" root@178.128.33.73
cd /opt/rezvo/frontend
npm run build
systemctl restart nginx
```

---

## 📱 Mobile Testing URLs

Test on your phone by visiting:
- http://rezvo.co.uk/
- http://rezvo.co.uk/search
- http://rezvo.co.uk/login

Or use Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M) to test responsive layouts.

---

## ✅ Deployment Confirmation

**Git Commits:**
- `5b043a2` — Add directory pages with UXPilot designs
- `e82c2a6` — Add directory pages deployment summary

**Server Status:**
- Frontend built: ✅ (308 KB JS, 35 KB CSS, 91 MB images)
- Nginx serving: ✅ (from `/opt/rezvo/frontend/dist`)
- Backend running: ✅ (`rezvo-backend.service` active)
- Images deployed: ✅ (57 files in `/opt/rezvo/frontend/dist/images/`)

**Everything is LIVE and ready to test!**

---

**Next Step:** Open http://rezvo.co.uk/ in your browser and verify the new directory landing page loads correctly. If you see the hero section with "Discover & Book Local Favourites", the deployment is successful! 🎉
