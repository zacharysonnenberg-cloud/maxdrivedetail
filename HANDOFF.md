# CODEBASE HANDOFF — Vault Detail Co.

> Pass this document to a new Claude Code session. It contains everything needed to continue this project with zero memory of previous conversations.

**Last updated:** 2026-05-23  
**Built with:** Claude Code over multiple sessions

---

## 1. WHO YOU'RE BUILDING FOR

**Owner:** Zach Sonnenberg — 17-year-old, Vienna VA  
**Business:** Vault Detail Co. — premium mobile auto detailing  
**Phone:** 571-278-7350  
**Email:** zacharysonnenberg@gmail.com  
**Instagram:** @vaultdetailco  
**TikTok:** @3sdetailingva  
**Google Reviews:** https://share.google/R7SeGQyOxR5cV5J1h  
**Domain (target):** https://vaultdetailco.com

**Working style:** Action over back-and-forth. No preambles. Just do it.

---

## 2. PROJECT OVERVIEW

A complete 7-page static marketing + booking website for a one-person mobile detailing business. No framework, no build step. Pure HTML/CSS/JS, deployable by dragging a folder to Netlify.

**Local project path:** `C:\Users\zacha\OneDrive\video\3s-detailing\`  
**Output/deploy package:** `C:\Users\zacha\OneDrive\video\vault_detail_co_final\`  
**Preview server:** `serve -p 3000 "C:\Users\zacha\OneDrive\video\3s-detailing"` → `http://localhost:3000`

---

## 3. TECH STACK

| Layer | Detail |
|---|---|
| **Markup** | Semantic HTML5 |
| **Styling** | Vanilla CSS — CSS custom properties, no Sass/PostCSS |
| **Scripting** | Vanilla JS — IIFEs, IntersectionObserver, no jQuery or React |
| **Fonts** | Google Fonts CDN — Bebas Neue, Barlow Condensed, Barlow, Inter |
| **Backend** | Google Apps Script (deployed as Web App) |
| **Offline** | Service Worker (`sw.js`) — cache-first assets, network-first HTML |
| **SEO** | Schema.org JSON-LD (@graph — AutoBodyShop + BreadcrumbList + FAQPage), full meta/OG/Twitter |
| **Hosting (target)** | Netlify (drag-and-drop) or Vercel |
| **Build tools** | None — no npm, no webpack, no bundler |

---

## 4. ALL FILES — COMPLETE INVENTORY

### Project directory: `C:\Users\zacha\OneDrive\video\3s-detailing\`

| File | Size | Status | Purpose |
|---|---|---|---|
| `index.html` | 147 KB | ✅ Complete | Main homepage — all sections, full SEO, all interactive features |
| `services.html` | 34 KB | ✅ Complete | Full services & pricing page — all 9 tiers with detail + policies |
| `gallery.html` | 39 KB | ✅ Complete | Portfolio gallery — filterable grid with photo/video lightbox |
| `contact.html` | 37 KB | ✅ Complete | Contact form + info sidebar — submits to Apps Script |
| `book.html` | 53 KB | ✅ Complete | 5-step booking wizard — service → vehicle → date/time → info → review |
| `sw.js` | 2 KB | ✅ Complete | Service worker — offline shell caching, network-first HTML strategy |
| `apps-script.js` | 17 KB | ✅ Written, ⚠️ NOT FULLY CONFIGURED | Google Apps Script backend — needs SHEET_ID filled in |
| `Logo.png` | 790 KB | ✅ Exists | Vault Detail Co. logo — used with `mix-blend-mode: screen` |
| `dashboard.html` | 46 KB | ✅ Complete | Password-protected booking dashboard (admin tool, not customer-facing) |
| `customers.html` | 40 KB | ✅ Complete | Password-protected CRM page — customer profiles from booking data |
| `HANDOFF.md` | — | ✅ This file | Session-to-session handoff doc |
| `index.backup.html` | 92 KB | Archive | Backup of older index.html version — safe to ignore |

### Output package: `C:\Users\zacha\OneDrive\video\vault_detail_co_final\`

Same as above minus `dashboard.html`, `customers.html`, `HANDOFF.md`, `index.backup.html`.  
This is the folder that gets dragged to Netlify for deployment.

### Media directory: `C:\Users\zacha\OneDrive\video\3s-detailing\media\`

**Videos (referenced in HTML as `media/filename.mp4`):**
```
post_27_minivan_food_disaster_before.mp4   (~28MB) — before/after slider, pair 1 before
post_28_minivan_clean_interior_after.mp4   (~15MB) — before/after slider, pair 1 after
post_29_minivan_yellow_mess_closeup.mp4    (~23MB) — gallery strip
post_30_suv_foam_cannon_full_blast.mp4     (~45MB) — gallery strip
post_31_explorer_wheel_arch_spray.mp4      (~36MB) — gallery strip
post_32_q50_wheel_spoke_detail_brush.mp4   (~41MB) — gallery strip
post_33_q50_full_setup_pressure_wash.mp4   (~36MB) — gallery strip
post_34_pet_hair_floor_mat_before.mp4      (~28MB) — before/after slider, pair 2 before
post_35_floor_mat_foam_scrub_action.mp4    (~35MB) — before/after slider, pair 2 after
post_36_trunk_gear_bts_reveal.mp4          (~28MB) — About section video
```
**Total video size: ~315MB — needs Handbrake compression before deploy (target: ~60MB)**  
Handbrake settings: H.264, CRF 28, max 1080p, AAC audio

**Photos (57 JPG files, IMG_4031 through IMG_4732):**  
~1–2.5MB each, referenced in `gallery.html`. Real customer job photos.

---

## 5. CSS DESIGN TOKENS

### index.html (master token set — use these as reference)

```css
:root {
  --bg:       #0A0A0A;     /* near-black page background */
  --bg2:      #111214;     /* slightly lighter bg for alternating sections */
  --surface:  #1C1F24;     /* card / panel backgrounds */
  --surface2: #242830;     /* nested card backgrounds */
  --graphite: #2B2F36;     /* dividers, very muted elements */
  --chrome:   #8A9099;     /* secondary body text, subheadings */
  --silver:   #C8CDD4;     /* lighter secondary text */
  --white:    #F2F4F6;     /* primary text color */
  --text:     #F2F4F6;     /* alias for --white */

  /* PRIMARY ACCENT — blue (CSS vars named --gold for legacy reasons) */
  --gold:     #1A72E8;     /* ← THIS IS BLUE, not gold. Legacy naming. DO NOT CHANGE TO GOLD. */
  --gold-l:   #5AAAFF;     /* lighter blue */
  --gold-d:   #0A3EA8;     /* darker blue */
  --gold-g:   linear-gradient(135deg, #5AAAFF 0%, #1A72E8 50%, #0A3EA8 100%);

  --border:   rgba(26,114,232,.15);  /* subtle blue-tinted borders */
  --border2:  rgba(26,114,232,.30);  /* slightly stronger borders */

  --radius:    6px;
  --radius-sm: 3px;
  --max-w:     1200px;
  --nav-h:     68px;
}
```

### Light mode overrides (index.html)

```css
[data-theme="light"] {
  --bg:       #F2F4F6;
  --bg2:      #EAECEF;
  --surface:  #FFFFFF;
  --surface2: #F7F8FA;
  --graphite: #C0C4CC;
  --chrome:   #5A6070;
  --silver:   #3A3F4A;
  --white:    #0A0A0A;
  --text:     #0A0A0A;
  --gold:     #1A72E8;     /* stays blue in light mode */
  --gold-l:   #3D8EF0;
  --gold-d:   #0A3EA8;
  --border:   rgba(26,114,232,.18);
  --border2:  rgba(26,114,232,.32);
}
/* Hero always stays dark regardless of mode */
[data-theme="light"] #hero { background: #0A0A0A; }
[data-theme="light"] .hero-stats { background: rgba(10,10,10,.9); }
```

### Secondary pages token set (services, contact, gallery)

```css
:root {
  --bg:#080808; --bg2:#0c0c0c; --surface:#0f0f0f; --surface2:#141414;
  --border:#1c1c1c; --blue:#1A72E8; --blue-mid:#4d9aff; --blue-lite:#5AAAFF;
  --white:#f0f0f0; --gray:#888; --muted:#3d3d3d;
  --radius-sm:6px; --radius:12px; --radius-lg:18px;
  --max-w:1200px; --nav-h:64px;
}
```

### book.html token set (uses --gold aliases, same blue values)

```css
:root {
  --bg: #080808; --bg2: #0c0c0c; --surface: #0f0f0f; --surface2: #141414;
  --border: #1c1c1c;
  --gold: #1A72E8; --gold-l: #5AAAFF; --gold-d: #0A3EA8;
  --blue: #1A72E8; --blue-mid: #4d9aff; --blue-lite: #5AAAFF;
  --white: #f0f0f0; --gray: #888; --muted: #3d3d3d;
  --radius-sm: 6px; --radius: 12px; --radius-lg: 18px;
  --max-w: 1200px; --nav-h: 64px;
}
```

### Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display numbers / counters | Bebas Neue | 400 | Used on step numbers, stat counts |
| Section headings / labels / buttons | Barlow Condensed | 700–900 | All-caps, letter-spacing |
| Body / descriptions | Barlow | 300–600 | Line-height 1.8–1.9 |
| Forms (book + contact) | Inter | 300–700 | Better legibility for inputs |

**Brand gradient text:**
```css
.brand-text {
  background: linear-gradient(120deg, var(--gold), var(--gold-l));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 6. FULL SITE STRUCTURE

### `index.html` — Section Map (top to bottom)

| Section | ID | Status | Notes |
|---|---|---|---|
| Nav | `#nav` | ✅ | Fixed, dark glass, logo left + links center + [Book Now] [🌙 toggle] right, hamburger mobile |
| Hero | `#hero` | ✅ | Dark bg (`#0A0A0A`), **no video** (removed), hero content bottom-anchored, stats bar |
| Before & After | `#results` | ✅ | 6-pair comparison slider grid, CSS clip-path drag (mouse+touch), lightbox (Esc/arrows) |
| Gallery | `#gallery` | ✅ | Filterable media grid, photo/video lightbox, category filter pills |
| Services & Pricing | `#services` | ✅ | Tab pills (Interior/Exterior/Packages/Add-Ons), 4-col grid rows, hover lift + book link |
| Pricing Calculator | `#calculator` | ✅ | 3-step selector (vehicle + tier + add-ons), live price animation, "Book at This Price" handoff |
| Why Vault Detail | `#why` | ✅ | Numbered editorial rows 01–04 |
| How It Works | `#process` | ✅ | 3-step grid + 4 policy cards (Deposit, Travel, Referral, Payment) |
| Reviews | `#reviews` | ✅ | Dual infinite marquee (row 1 LTR, row 2 RTL), pauses on hover, 5 real reviews |
| Testimonials Carousel | `#testimonials` | ✅ | 6 cards, 5s auto-advance, dot nav, arrow nav, swipe gesture, pause on hover |
| About | `#about` | ✅ | 2-col: video left (post_36) + text right, blockquote, 3 inline stats |
| FAQ | `#faq` | ✅ | **Two-column sticky** layout (left = heading pinned, right = accordion), 11 questions, keyboard nav |
| Footer | `footer` | ✅ | CTA block + footer grid + bottom bar |

**Hero note:** The hero video was removed. The hero now has `background: #0A0A0A` and uses a CSS overlay for depth. No video source needed.

### `services.html` — Full-page services breakdown

- Page hero with title + description
- Tabs: Interior / Exterior / Packages / Add-Ons
- `.uc-card` service cards with tier badge, price, time, features list
- Policies section (Booking Deposit, Travel Fee, Satisfaction Guarantee, Payment, Referral)
- Bottom CTA strip
- Has: dark/light mode toggle ✅, nav CTA pulse ✅, service worker registration ✅

### `gallery.html` — Portfolio gallery

- Filter bar: All / Interior / Exterior / Packages / Before & After
- Masonry-style media grid — photos and videos with captions
- Lightbox with keyboard navigation (Escape, arrow keys)
- Has: dark/light mode toggle ✅, nav CTA pulse ✅, service worker registration ✅

### `contact.html` — Contact & quote

- Two-column layout: form left, info sidebar right
- Form fields: first/last name, email, phone, subject, vehicle, message
- Submits via fetch to Apps Script (type: 'contact')
- Info sidebar: address, phone, email, hours, social links
- Google Maps placeholder (no embed yet — see TODOs)
- Has: dark/light mode toggle ✅, nav CTA pulse ✅, service worker registration ✅

### `book.html` — 5-step booking wizard

- Step 1: Service selection (tile grid with prices)
- Step 2: Vehicle type (sedan/SUV/truck/etc) + condition + notes
- Step 3: Date + time picker (blocks unavailable slots)
- Step 4: Contact info (name, email, phone, address)
- Step 5: Review & submit — shows full booking summary + deposit amount
- Submits via fetch to Apps Script (type: 'booking') → Google Calendar + Sheet + email
- Has: dark/light mode toggle ✅, nav CTA pulse ✅, service worker registration ✅

### `dashboard.html` — Admin booking dashboard

- Password-protected: `3sdetailing2026`
- Fetches bookings from Apps Script `?key=3sdetailing2026`
- Summary cards: Today / Upcoming / Total Revenue / Avg per Job
- Sortable booking table with expandable rows (notes, status)
- CSV export
- Link to `customers.html`
- ⚠️ Does NOT have dark/light mode toggle yet

### `customers.html` — Admin CRM

- Password-protected: `3sdetailing2026`
- De-dupes bookings into customer profiles (key: email || phone || name)
- Stats: Total Customers / Returning / Revenue / Avg
- Filter pills: All / Returning / New
- Sort + search
- Expandable rows: booking timeline + notes textarea (localStorage)
- CSV export
- ⚠️ Does NOT have dark/light mode toggle yet

### `sw.js` — Service worker

- Cache name: `vault-v1`
- Shells cached on install: `/`, `/index.html`, `/services.html`, `/gallery.html`, `/contact.html`, `/book.html`, `/Logo.png`, Google Fonts CSS
- Network-first for HTML pages; cache-first for all other assets
- `skipWaiting()` on install, `clients.claim()` on activate
- **Note:** Requires HTTPS to activate (Netlify provides this automatically)

---

## 7. INTERACTIVE FEATURES — INDEX.HTML

### Dark / Light Mode
- Toggle button in nav (moon icon → sun icon)
- Reads `localStorage.getItem('vdc-theme')` on load; falls back to `prefers-color-scheme`
- Writes to `localStorage.setItem('vdc-theme', next)` on click
- All 5 customer-facing pages have this wired up
- Hero section always stays dark regardless of mode

### Micro-animations
- **Hero headline:** clip-path word reveal — `inset(0 100% 0 0)` → `inset(0 0% 0 0)`, staggered 3 words
- **Nav CTA:** `nav-cta-glow` pulse every 3s (stops on hover)
- **Vault badge:** `float-badge` — gentle float up/down 6s loop
- **Step count-up:** IntersectionObserver → `requestAnimationFrame` count-up on `.step-num` elements
- **Service row hover:** translateY(-1px) + blue glow shadow

### Scroll Animations
- All `.reveal` elements observed by IntersectionObserver
- `threshold: 0.1` — triggers when 10% visible
- Stagger delays via `.reveal-d1` / `.reveal-d2` / `.reveal-d3`

### Pricing Calculator
- 3 selector groups: vehicle type (data-mod = price modifier), service tier (data-base = base price), add-ons (data-add = additive, toggleable)
- Live price display with 180ms fade animation on update
- "Book at This Price" CTA encodes selections into `book.html` URL params

### Before/After Comparison Slider
- 6 pairs in 3-column grid (pairs 1–2 have real videos; pairs 3–6 use dark gradient placeholders)
- CSS clip-path drag — `mousemove` + `touchmove` events update clip-path on `.ba-before`
- Lightbox: click any pair to open full-screen, keyboard nav (Escape, ArrowLeft, ArrowRight)

### Testimonials Carousel
- 6 cards, auto-advances every 5s
- Pauses on hover
- Dot navigation + prev/next arrows
- Touch swipe (>50px threshold)

### FAQ Accordion
- 11 questions, ARIA expanded attributes
- Keyboard nav: ArrowUp/ArrowDown/Home/End
- Two-column sticky layout (left pinned, right scrolls) — **do not break this layout**
- Click to toggle open/close; only one open at a time

### Reviews Marquee
- Two rows: row 1 scrolls LTR, row 2 scrolls RTL
- `animation-play-state: paused` on `.marquee-track:hover`
- 5 real reviews duplicated for seamless loop

---

## 8. BACKEND — GOOGLE APPS SCRIPT

**File:** `apps-script.js`  
**Deployed URL:** `https://script.google.com/macros/s/AKfycbzqGGGLx8-6MCl2o1uuDCcYN7XGilM8Z8LsYT7ZRNQbcJowBjqrYjo2kp9E2JPNcxBt/exec`

### Config variables (top of file)
```javascript
var OWNER_EMAIL   = 'Zacharysonnenberg@gmail.com';
var CALENDAR_ID   = 'primary';
var DEPOSIT_LINK  = '';          // ⚠️ EMPTY — needs Venmo/Zelle/Square URL
var SHEET_ID      = '';          // ⚠️ EMPTY — needs Google Sheet ID
var DASHBOARD_KEY = '3sdetailing2026';
```

### Entry points
```
doPost(e)     type='booking' → Calendar event + Sheet row + confirmation email + owner alert
              type='contact' → email to owner
doGet(e)      ?key=3sdetailing2026 → returns all Sheet rows as JSON for dashboard/CRM
```

### How to set up (what's still needed)
1. Create a Google Sheet at sheets.google.com
2. Copy the Sheet ID from the URL (long string between `/d/` and `/edit`)
3. Paste into `SHEET_ID` in `apps-script.js`
4. Add a Venmo/Zelle/Square payment link to `DEPOSIT_LINK`
5. Open script.google.com → paste `apps-script.js` → Deploy → New deployment → Web App → Anyone → Deploy
6. Copy the new deployment URL
7. The existing deployed URL may still work — verify before replacing

### Sheet columns (auto-created)
`Timestamp, Name, Email, Phone, Service, Vehicle, Date, Time, Notes, Total, Deposit, Source`

### Authentication
- Dashboard password: `3sdetailing2026`
- Session key: `3s_dash_v1` (stored as `btoa(password)` in `sessionStorage`)
- Rate limit: 5 failed attempts → 30s lockout (stored in `localStorage`)

---

## 9. SEO IMPLEMENTATION

### Structured Data (index.html `<head>`)
- `@graph` with `AutoBodyShop` (LocalBusiness) entity
  - Address: Vienna VA 22180
  - Geo: 38.9012, -77.2653
  - Phone: +15712787350
  - Hours: Mon–Sat 8am–6pm
  - Aggregate rating: 5.0 (5 reviews)
  - 3 inline reviews (Bailey Sexton, David McCarthy, Jessica Wood Leigh)
  - 8 service offers with prices and descriptions
  - sameAs: Instagram, founder: Zach Sonnenberg
- `BreadcrumbList` with 5 items
- Separate `FAQPage` schema with 6 questions

### Meta tags
- Canonical: `https://vaultdetailco.com/`
- OG: title, description, type, url, locale, site_name
- Twitter Card: summary_large_image
- Geo: region US-VA, placename Vienna Virginia, position 38.9012;-77.2653
- Keywords: mobile detailing Vienna VA, mobile car detailing McLean, mobile car detailing Reston, auto detailing Fairfax County, etc.
- Robots: index, follow

---

## 10. FULL PRICING REFERENCE

### Interior
| Tier | Name | Price | Time |
|---|---|---|---|
| L1 | Interior Refresh | $115 | ~60 min |
| L2 | Interior Deep Clean ⭐ | $175 | ~2 hrs |
| L3 | Interior Full Restoration | $245 | ~3 hrs |

### Exterior
| Tier | Name | Price | Time |
|---|---|---|---|
| L1 | Exterior Wash & Protect | $139 | ~90 min |
| L2 | Exterior Decon & Enhance ⭐ | $219 | ~2.5 hrs |
| L3 | Paint Correction | $375 | ~5 hrs |
| L4 | Ceramic Coating | By Quote | 7+ hrs |

### Packages
| Tier | Name | Price | Time |
|---|---|---|---|
| P1 | Complete Detail ⭐ | $265 | ~3.5 hrs |
| P2 | Signature Restoration | $615 | ~8 hrs |

### Add-Ons
| Service | Price |
|---|---|
| Scent Restoration (Ozone) | $35 |
| Pet Hair Removal | $45 |
| Headlight Restoration | $50 |
| Engine Bay Detail | $40 |

### Upcharges
- SUV / Crossover: +$15–20
- Large SUV / Minivan / 3-row: +$25–35
- Full-size truck: +$20–30
- Moderate soil condition: +$30
- Heavy neglect: +$50–75
- Extreme / biohazard: custom quote

### Policies
- **Deposit:** 15% to hold. Full refund 48+ hrs. 50% kept 24–48 hrs. Full forfeit under 24 hrs.
- **Travel:** Free within 6 mi of Vienna. 6–15 mi +$15. 15–25 mi +$25. 25+ mi by quote.
- **Referral:** Referrer + new client each get $20 off.
- **Payment:** Zelle, Venmo, cash. Due on completion. Minimum job: $100.
- **Satisfaction:** Return fix within 48 hrs if not satisfied. No refunds on completed labor.

---

## 11. 5 REAL CUSTOMER REVIEWS

1. **Bailey Sexton** · Vienna, VA — *"Such a good experience with these guys — my car feels brand new like I just drove it off the lot. Would recommend them to anyone and appreciated how thorough they were!"*
2. **David McCarthy** · Vienna, VA — *"These guys do a great job! This is my second time doing business with them, and I have to say, their detailing work is top notch."*
3. **Jessica Wood Leigh** · Vienna, VA — *"Had a great experience with 3S Detailing! Very impressed with the attention to detail and the hustle, even in 90+ degree heat."*
4. **Carlen** · Vienna, VA — *"My car hadn't been detailed in a couple of years, so it was definitely overdue. Booking on the 3S Detailing website was easy and Zach did an incredible job."*
5. **Samuel Flannigan** · Vienna, VA — *"Very good clean — cleanest it's ever been. I like how smooth it feels."*

---

## 12. PENDING WORK & KNOWN ISSUES

### 🔴 Critical (blocks functionality)

- [ ] **`SHEET_ID` in `apps-script.js` is empty** — bookings won't save to a spreadsheet until this is filled in. Zach needs to create a Google Sheet, copy its ID from the URL, paste it in, and redeploy.
- [ ] **`DEPOSIT_LINK` in `apps-script.js` is empty** — booking confirmation emails can't include a payment link. Add a Venmo or Square URL.

### 🟡 Important (affects launch readiness)

- [ ] **Before/after slider pairs 3–6 are placeholders** — pairs 3–6 in the comparison slider use dark gradient placeholders. Need real before/after photos of: Tesla Model 3 exterior, Ford Explorer wheels, BMW 3 Series paint correction, Chevy Suburban full detail.
- [ ] **Video compression needed** — all 10 MP4 files in `media/` total ~315MB. Run through Handbrake (H.264, CRF 28, max 1080p) before deploy. Target: ~60MB total.
- [ ] **Domain not pointed** — canonical URLs reference `vaultdetailco.com`. Domain needs to be registered and DNS pointed to Netlify/Vercel after deploy.
- [ ] **Instagram handle unconfirmed** — schema markup has `https://www.instagram.com/vaultdetailco`. Confirm this account is live and the handle is correct.

### 🟢 Nice-to-have

- [ ] **Google Maps embed in `contact.html`** — there's a placeholder comment where a Google Maps embed should go for the Vienna, VA service area.
- [ ] **Dark/light mode for `dashboard.html` and `customers.html`** — the admin pages don't have the theme toggle yet (only the 5 customer-facing pages do).
- [ ] **Google Analytics or Plausible** — no traffic tracking is set up yet.
- [ ] **Google Search Console** — add verification meta tag after domain is live.
- [ ] **Token consistency across pages** — `index.html` uses one token set (--bg, --surface, --chrome, etc.); secondary pages use a slightly different set (--bg, --surface, --blue, --gray). Functional but not perfectly unified.

---

## 13. HARD RULES — DO NOT UNDO THESE

These decisions were made deliberately. Any new work must respect them:

1. **No Setmore.** Setmore was explicitly removed. Do not add a Setmore embed, Setmore booking page link, or Setmore JS script to any page.
2. **No ticker tape in the hero.** A scrolling marquee was removed from the hero. Do not add it back.
3. **No hero video.** The hero background video was removed and replaced with a solid dark background (`#0A0A0A`). Do not put a video back in the hero.
4. **Hero content is bottom-anchored, not centered.** `hero-content` uses `position: absolute; bottom: 0`. Do not move it to the center of the screen.
5. **FAQ is a two-column sticky layout on desktop.** Left column (heading + CTA) is sticky. Right column is the accordion. Do not collapse this to a single column on desktop.
6. **Brand color is BLUE (#1A72E8).** CSS variable names like `--gold`, `--gold-l`, `--gold-d` are legacy naming aliases that all resolve to blue values. Do not change them to actual gold/yellow.
7. **`customers.html` is its own page**, not a tab inside `dashboard.html`. Keep them separate files.
8. **All pages use `Logo.png` with `mix-blend-mode: screen`** — this makes the logo appear correctly against dark backgrounds. Don't remove the mix-blend-mode.

---

## 14. HOW THE PAGES LINK

```
index.html
  ├── #services (anchor) — services section on same page
  ├── #gallery (anchor) — gallery section on same page
  ├── #results (anchor) — before/after section
  ├── #faq (anchor) — FAQ section
  ├── services.html — nav link + some CTAs
  ├── gallery.html — nav link
  ├── contact.html — nav link + ceramic coating CTA
  └── book.html — all "Book Now" CTAs + calculator "Book at This Price"

book.html
  └── submits to Apps Script (doPost, type='booking')
      → Creates Google Calendar event
      → Logs row to Google Sheet (requires SHEET_ID)
      → Sends confirmation email to customer (with DEPOSIT_LINK)
      → Sends alert email to owner

contact.html
  └── submits to Apps Script (doPost, type='contact')
      → Sends email to owner

dashboard.html (password: 3sdetailing2026)
  ├── fetches Apps Script (doGet, ?key=3sdetailing2026)
  └── links to customers.html

customers.html (password: 3sdetailing2026)
  └── fetches same Apps Script endpoint
```

---

## 15. DEPLOYMENT INSTRUCTIONS

### Netlify (recommended — easiest)
1. Go to netlify.com, sign in
2. Drag the entire `vault_detail_co_final` folder onto the Netlify drop zone
3. Site goes live instantly at a random `.netlify.app` URL
4. Add custom domain: Site settings → Domain management → Add `vaultdetailco.com`
5. Netlify auto-provisions SSL — required for service worker to activate

### Service worker note
`sw.js` only activates over HTTPS. It will be silently skipped on plain HTTP (localhost is an exception and works fine for dev).

### After deploying
- Submit `https://vaultdetailco.com/` to Google Search Console
- Verify with the meta tag they provide
- Submit sitemap (if one is created)

---

## 16. QUICK-START FOR NEW SESSIONS

```
1. Local path:   C:\Users\zacha\OneDrive\video\3s-detailing\
2. Preview:      serve -p 3000 "C:\Users\zacha\OneDrive\video\3s-detailing" → localhost:3000
3. Output pkg:   C:\Users\zacha\OneDrive\video\vault_detail_co_final\
4. After edits:  copy updated files to vault_detail_co_final\ before declaring done
5. Write files:  use [System.IO.File]::WriteAllText() in PowerShell if files are locked by browser/server
```

**Most useful next tasks:**
- Fill in `SHEET_ID` and `DEPOSIT_LINK` in `apps-script.js` → redeploy → test booking end-to-end
- Get real before/after photos for slider pairs 3–6
- Compress videos with Handbrake
- Deploy to Netlify + point `vaultdetailco.com` domain
- Add Google Analytics (gtag or Plausible)

---

*Last updated: 2026-05-23 — Vault Detail Co. website, built across multiple Claude Code sessions*
