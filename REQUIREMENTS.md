# SYRA — Anti-Tarnish Jewellery E-Commerce | Full Requirements

## 1. Project Overview

**Brand:** SYRA  
**Tagline:** Timeless Anti-Tarnish Elegance  
**Niche:** Premium anti-tarnish (PVD-coated) jewellery — waterproof, sweat-proof, hypoallergenic  
**Market:** India (primary), with future international expansion  
**Stack:** Next.js 14 (App Router) · Tailwind CSS · Prisma + SQLite · Cloudinary (images) · Zustand (client state)  
**Admin:** Built into same app at `/admin` routes (protected)  
**Payments:** Razorpay (India) + Stripe (International)  
**Shipping:** India only (for now)  
**Rental feature:** Removed — buy-only store  

---

## 2. Architecture

```
┌─────────────────────────────────────────────────┐
│                  NEXT.JS APP                      │
├──────────────┬──────────────┬───────────────────┤
│  STOREFRONT  │   ADMIN      │   API ROUTES      │
│  (public)    │   (/admin)   │   (/api/...)      │
├──────────────┴──────────────┴───────────────────┤
│              PRISMA ORM + SQLite                  │
├─────────────────────────────────────────────────┤
│              CLOUDINARY (images)                  │
└─────────────────────────────────────────────────┘
```

### Why SQLite + Prisma?
- Zero cost, zero setup, runs anywhere
- Single file database — easy to backup and migrate
- Prisma gives type-safe queries and migrations
- Can upgrade to PostgreSQL later with one config change

### Why Cloudinary?
- Free tier: 25GB storage, 25GB bandwidth/month
- Auto image optimization (WebP, responsive sizes)
- Upload widget built-in
- No server storage needed

---

## 3. Database Schema

### Products
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Product title |
| slug | String | URL-friendly ID |
| kind | Enum | Ring, Necklace, Earrings, Bracelet, Nose Ring, Anklet |
| caption | String | Short tagline |
| description | Text | Full product description (rich text) |
| price | Int | Price in paise (₹120 = 12000) |
| compareAtPrice | Int? | Strikethrough price for sales |
| metals | JSON | Array of available metals |
| stones | JSON | Array of available stones |
| sizes | JSON | Array of available sizes |
| tag | String? | BESTSELLER, NEW, ONE OF ONE, LOW STOCK, SALE |
| image | String | Main image URL (Cloudinary) |
| gallery | JSON | Array of gallery image URLs |
| modelImages | JSON | "See on model" images |
| bundleIds | JSON | "Complete the Look" product IDs |
| weight | Float? | Weight in grams |
| material | String? | e.g. "Surgical Steel + 18k Gold PVD" |
| warranty | String? | e.g. "2 Year Anti-Tarnish Guarantee" |
| seoTitle | String? | Custom SEO title |
| seoDescription | String? | Custom meta description |
| published | Boolean | Show on storefront |
| featured | Boolean | Show in featured sections |
| sortOrder | Int | Manual sort position |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Categories
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Category name |
| slug | String | URL slug |
| image | String? | Category banner image |
| description | String? | Category description |
| sortOrder | Int | Display order |

### Orders
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| orderNumber | Int | Auto-increment display ID |
| status | Enum | pending, confirmed, shipped, delivered, cancelled |
| paymentStatus | Enum | pending, paid, failed, refunded |
| paymentMethod | String | razorpay / stripe |
| paymentId | String? | Gateway transaction ID |
| email | String | Customer email |
| phone | String | Customer phone |
| firstName | String | |
| lastName | String | |
| address | String | Street address |
| city | String | |
| state | String | |
| pincode | String | |
| country | String | Default: India |
| subtotal | Int | In paise |
| shippingCost | Int | In paise |
| discount | Int | In paise |
| total | Int | In paise |
| items | JSON | Snapshot of cart items at order time |
| notes | String? | Customer notes |
| trackingNumber | String? | Shipping tracking |
| trackingUrl | String? | Tracking link |
| giftWrap | Boolean | Gift wrapping selected |
| giftMessage | String? | Gift card message |
| couponCode | String? | Applied coupon |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### SiteContent (CMS)
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| section | String | Unique key: "hero", "banner_1", "why_anti_tarnish", etc. |
| title | String? | Heading text |
| subtitle | String? | Subheading |
| body | Text? | Body copy (supports markdown) |
| image | String? | Image URL |
| image2 | String? | Secondary image (for comparisons) |
| link | String? | CTA link |
| linkText | String? | CTA button text |
| metadata | JSON? | Extra structured data |
| published | Boolean | Show/hide section |
| sortOrder | Int | Display order within page |
| page | String | Which page: "home", "about", "care", etc. |
| updatedAt | DateTime | |

### Banners
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| title | String | Banner heading |
| subtitle | String? | Banner subtext |
| image | String | Banner image URL |
| mobileImage | String? | Mobile-specific image |
| link | String? | Click destination |
| position | String | "hero", "mid_page", "footer_banner" |
| page | String | Which page to show on |
| published | Boolean | Active/inactive |
| sortOrder | Int | Carousel order |
| startDate | DateTime? | Scheduled start |
| endDate | DateTime? | Scheduled end |

### Coupons
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| code | String | Unique coupon code |
| type | Enum | percentage, fixed |
| value | Int | Discount value (% or paise) |
| minOrder | Int? | Minimum order value |
| maxUses | Int? | Total usage limit |
| usedCount | Int | Current usage count |
| active | Boolean | |
| expiresAt | DateTime? | |

### BlogPosts
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| title | String | Post title |
| slug | String | URL slug |
| excerpt | String? | Short preview |
| content | Text | Full markdown content |
| coverImage | String? | Hero image |
| author | String | Author name |
| tags | JSON | Array of tags |
| published | Boolean | |
| publishedAt | DateTime? | |
| createdAt | DateTime | |

### AdminUsers
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| email | String | Login email |
| passwordHash | String | bcrypt hash |
| name | String | Display name |
| role | Enum | superadmin, editor |
| createdAt | DateTime | |

---

## 4. Storefront Pages (Public)

### 4.1 Home Page (`/`)
- **Hero carousel** — admin-editable banners (image, title, CTA, link)
- **Announcement bar** — editable text + link
- **"Why Anti-Tarnish?" section** — side-by-side comparison (before/after 6 months)
- **Featured collection grid** — admin picks featured products
- **Trust badges strip** — Anti-tarnish guarantee, Waterproof, Hypoallergenic, 2-Year Warranty
- **Instagram UGC feed** — embedded Instagram grid or manual image upload
- **Price tier carousel** — "Under ₹999", "Under ₹1999", "Under ₹2999"
- **Testimonials** — customer reviews with photos
- **Newsletter signup** — email capture
- **WhatsApp floating button** — fixed bottom-right

### 4.2 Collection Page (`/collection`)
- Filterable product grid
- Filters: Kind, Metal, Stone, Price range, Size, Tags
- Sort: Price low→high, high→low, Newest, Bestselling
- URL-synced filters (`?kind=Ring&metal=18k+Gold`)
- Responsive: 2-col mobile, 3-col tablet, 4-col desktop

### 4.3 Product Detail Page (`/products/[slug]`)
- Image gallery with zoom
- "See on model" tab (admin uploads model photos)
- Variant selection: Metal, Stone, Size
- Size guide link (opens modal with printable PDF)
- Trust badges (waterproof, anti-tarnish, hypoallergenic)
- "Complete the Look" — related products bundle
- Add to cart + Buy Now
- Gift wrapping option toggle
- Product description (rich text from admin)
- Warranty info
- Shipping estimate
- WhatsApp inquiry button ("Ask about this piece")

### 4.4 Cart Drawer
- Slide-over from right
- Line items with image, name, variant, qty, price
- Gift wrap toggle per item
- Coupon code input
- Free shipping progress bar (e.g. "₹200 away from free shipping!")
- Subtotal + shipping estimate
- Checkout CTA

### 4.5 Checkout (`/checkout`)
- Step 1: Contact (email, phone) + Shipping address
- Step 2: Shipping method (Standard free over ₹999, Express ₹99)
- Step 3: Payment (Razorpay / Stripe)
- Gift wrapping option + message
- Order summary sidebar
- Coupon application

### 4.6 Order Confirmation (`/confirmation/[orderId]`)
- Order number + status
- Items summary
- Shipping address
- Estimated delivery
- "Track order" link (when tracking added)
- "Continue shopping" CTA

### 4.7 Account Pages (`/account`)
- Dashboard with recent orders
- Profile edit (name, email, phone)
- Saved addresses (add/edit/delete)
- Order history with status tracking
- Wishlist

### 4.8 Auth Pages
- `/login` — Email + password (with "forgot password" link)
- `/register` — Name, email, password
- `/forgot-password` — Email input → reset link
- `/reset-password` — New password form

### 4.9 Content Pages
- `/about` — Brand story (admin-editable)
- `/care-guide` — PVD technology, care instructions (admin-editable)
- `/warranty` — **NEW** — 2-year guarantee details, claim process
- `/size-guide` — Ring/bracelet sizing with printable PDF
- `/contact` — Contact form + WhatsApp + email + address
- `/returns` — Return policy (admin-editable)
- `/terms` — Terms & conditions
- `/privacy` — Privacy policy
- `/shipping` — Shipping info, delivery times, pincode check

### 4.10 Blog/Journal (`/journal`)
- Blog listing page with cards
- Individual post page (`/journal/[slug]`)
- Tags/categories filter
- SEO-optimized (meta tags, structured data)

### 4.11 Search (`/search`)
- Full-text search across products
- Instant results in search modal (⌘K)
- Recent searches saved locally

### 4.12 404 Page
- Branded "page not found" with search + home CTA

---

## 5. Admin Panel (`/admin`)

### 5.1 Authentication
- Email + password login
- Session-based auth (HTTP-only cookies)
- Role-based: superadmin (full access), editor (content only)
- Protected by middleware — redirects to `/admin/login` if unauthenticated

### 5.2 Dashboard (`/admin`)
- Today's orders count + revenue
- Total products / published / draft
- Recent orders list (last 10)
- Quick actions: Add product, View store, Export orders

### 5.3 Products (`/admin/products`)
- **List view** — table with image, name, price, stock, status, actions
- **Add/Edit product** — full form:
  - Name, slug (auto-generated), caption, description (rich text editor)
  - Price, compare-at price
  - Kind (dropdown), metals (multi-select), stones (multi-select), sizes (multi-select)
  - Tag (dropdown)
  - Main image upload (Cloudinary widget)
  - Gallery images (drag-to-reorder)
  - Model images ("See on model")
  - "Complete the Look" — search + link other products
  - Weight, material, warranty text
  - SEO title + description
  - Published toggle, Featured toggle
- **Bulk upload** — CSV import:
  - Download template CSV
  - Upload CSV with columns: name, kind, price, metals, stones, sizes, image_url, description, tag
  - Preview + confirm before import
  - Error report for invalid rows
- **Bulk actions** — select multiple → publish/unpublish/delete

### 5.4 Orders (`/admin/orders`)
- **List view** — table with order#, customer, total, status, date
- **Order detail** — full order info:
  - Customer details
  - Items with images
  - Payment status + gateway ID
  - Update status (dropdown: pending → confirmed → shipped → delivered)
  - Add tracking number + URL
  - Notes field
- **Export** — CSV download of orders (date range filter)

### 5.5 Site Content / CMS (`/admin/content`)
- **Page selector** — dropdown to pick page (Home, About, Care Guide, etc.)
- **Section editor** — for each section on the page:
  - Edit title, subtitle, body text
  - Upload/change images
  - Edit CTA link + text
  - Toggle published/hidden
  - Reorder sections (drag)
- **Banner manager** — add/edit/delete banners:
  - Upload desktop + mobile images
  - Set title, subtitle, link
  - Set page + position
  - Schedule (start/end dates)
  - Reorder carousel

### 5.6 Blog (`/admin/blog`)
- List of posts (title, status, date)
- Add/Edit post:
  - Title, slug, excerpt
  - Rich text editor for content (markdown)
  - Cover image upload
  - Tags (multi-input)
  - Published toggle + publish date

### 5.7 Coupons (`/admin/coupons`)
- List of coupons (code, type, value, uses, status)
- Add/Edit coupon:
  - Code, type (% or fixed), value
  - Min order, max uses, expiry date
  - Active toggle

### 5.8 Settings (`/admin/settings`)
- **Store info** — brand name, tagline, logo, contact email, phone, address
- **Shipping** — free shipping threshold, standard/express rates
- **Payment** — Razorpay key, Stripe key (masked display)
- **SEO** — default meta title, description, OG image
- **Social links** — Instagram, Facebook, WhatsApp number
- **Announcement bar** — text, link, enabled toggle

### 5.9 Bulk Upload Flow (`/admin/products/bulk-upload`)
1. Download CSV template button
2. File upload dropzone (accepts .csv)
3. Parse + show preview table (first 10 rows)
4. Validation: highlight errors (missing required fields, invalid prices)
5. "Import X products" button
6. Progress bar during import
7. Result summary: X imported, Y skipped (with reasons)

---

## 6. API Routes (`/api`)

### Products
- `GET /api/products` — list (with filters, pagination)
- `GET /api/products/[slug]` — single product
- `POST /api/admin/products` — create product (admin)
- `PUT /api/admin/products/[id]` — update product (admin)
- `DELETE /api/admin/products/[id]` — delete product (admin)
- `POST /api/admin/products/bulk` — CSV bulk import (admin)

### Orders
- `GET /api/admin/orders` — list orders (admin)
- `GET /api/admin/orders/[id]` — order detail (admin)
- `PUT /api/admin/orders/[id]` — update status/tracking (admin)
- `POST /api/checkout` — create order from cart
- `GET /api/orders/[id]` — customer order detail (authenticated)

### Content
- `GET /api/content/[page]` — get page sections
- `PUT /api/admin/content/[id]` — update section (admin)
- `POST /api/admin/content` — create section (admin)
- `DELETE /api/admin/content/[id]` — delete section (admin)

### Banners
- `GET /api/banners/[page]` — get active banners for page
- `POST /api/admin/banners` — create banner (admin)
- `PUT /api/admin/banners/[id]` — update banner (admin)
- `DELETE /api/admin/banners/[id]` — delete banner (admin)

### Auth
- `POST /api/auth/login` — customer login
- `POST /api/auth/register` — customer register
- `POST /api/auth/forgot-password` — send reset email
- `POST /api/auth/reset-password` — set new password
- `POST /api/admin/auth/login` — admin login
- `POST /api/admin/auth/logout` — admin logout

### Payments
- `POST /api/checkout/razorpay` — create Razorpay order
- `POST /api/checkout/stripe` — create Stripe session
- `POST /api/webhooks/razorpay` — Razorpay webhook
- `POST /api/webhooks/stripe` — Stripe webhook

### Blog
- `GET /api/blog` — list posts
- `GET /api/blog/[slug]` — single post
- `POST /api/admin/blog` — create post (admin)
- `PUT /api/admin/blog/[id]` — update post (admin)
- `DELETE /api/admin/blog/[id]` — delete post (admin)

### Coupons
- `POST /api/coupons/validate` — validate + apply coupon
- `POST /api/admin/coupons` — create (admin)
- `PUT /api/admin/coupons/[id]` — update (admin)

### Upload
- `POST /api/admin/upload` — upload image to Cloudinary (admin)

---

## 7. UI/UX Standards

### Design System
- **Fonts:** Instrument Serif (display), Inter (body), JetBrains Mono (mono/labels)
- **Colors:** Dark theme primary — bg: #1f1812, ink: #faf3e2, accent: #c9a36b (gold)
- **Spacing:** 4px grid, generous whitespace
- **Borders:** 1px solid var(--line) — subtle, architectural
- **Animations:** Framer Motion for reveals, hover states, page transitions
- **Smooth scroll:** Lenis
- **Responsive:** Mobile-first, breakpoints at 768px (md) and 1024px (lg)

### Component Library
- Uses `@podium/ui` workspace package for shared primitives:
  - Button, Eyebrow, Placeholder, TagSticker
  - Reveal, WordReveal, Magnetic, Sparkles, Marquee, LoaderBar
  - Nav, Footer, PageBlocks
  - ScrollProgress, LiveDot

### Accessibility
- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus-visible styles
- Color contrast meets WCAG AA
- Alt text on all images

### Performance
- Next.js Image optimization
- Cloudinary responsive images (auto format, auto quality)
- ISR caching on product/content pages (revalidate: 60s)
- Lazy loading for below-fold content
- Code splitting per route

---

## 8. New Features (To Build)

### 8.1 "Why Anti-Tarnish?" Section (Home Page)
- Side-by-side image comparison (regular jewellery vs SYRA after 6 months)
- Animated slider to reveal before/after
- Key stats: "2 Year Guarantee", "Waterproof", "Sweat-proof", "Hypoallergenic"
- Admin-editable images and text

### 8.2 Warranty Page (`/warranty`)
- 2-year anti-tarnish guarantee details
- What's covered / what's not
- How to make a claim (form or WhatsApp)
- Trust badges

### 8.3 Instagram UGC Feed (Home Page)
- Grid of customer photos (admin uploads manually or Instagram embed)
- "Shop the look" links to products
- Admin can add/remove/reorder images

### 8.4 WhatsApp Floating Button
- Fixed bottom-right on all pages
- Opens WhatsApp chat with pre-filled message
- Admin configurable phone number + default message

### 8.5 "Complete the Look" (PDP)
- Admin links related products as a bundle
- Shows on product page: "Pair with these pieces"
- "Add all to cart" button

### 8.6 Size Guide
- Modal with ring/bracelet size charts
- Printable ring sizer PDF (downloadable)
- "How to measure" instructions with images

### 8.7 Gift Wrapping
- Toggle at cart/checkout level
- Optional gift message (text field)
- Admin sets gift wrap price (or free)
- Shows in order details for fulfillment

### 8.8 Blog/Journal (`/journal`)
- SEO-focused content marketing
- Topics: styling tips, care guides, anti-tarnish education, lookbooks
- Admin writes + publishes from `/admin/blog`

### 8.9 Trust Badges
- Reusable component showing: Anti-Tarnish, Waterproof, Hypoallergenic, 2-Year Warranty
- Appears on: Home page, PDP, Cart, Checkout
- Icons + short text, admin can toggle which ones show

### 8.10 Coupon System
- Admin creates codes with rules (%, fixed, min order, expiry)
- Customer applies at cart/checkout
- Validated server-side
- Shows discount in order summary

---

## 9. Implementation Phases

### Phase 1 — Core (Current Sprint)
- [x] Storefront UI (home, collection, PDP, cart, checkout, account, auth)
- [ ] Prisma schema + SQLite database setup
- [ ] Admin authentication (login, session, middleware)
- [ ] Admin products CRUD (add, edit, delete, list)
- [ ] Admin bulk CSV upload
- [ ] Admin CMS (edit all page sections, banners, images, text)
- [ ] Connect storefront to database (replace mock data)
- [ ] Image upload to Cloudinary
- [ ] Working checkout with Razorpay
- [ ] Order management in admin

### Phase 2 — Features
- [ ] Stripe integration
- [ ] Coupon system
- [ ] Blog/Journal
- [ ] "Why Anti-Tarnish?" section
- [ ] Warranty page
- [ ] Size guide modal + PDF
- [ ] WhatsApp floating button
- [ ] Gift wrapping
- [ ] Trust badges component
- [ ] "Complete the Look" bundles
- [ ] Instagram UGC section
- [ ] Newsletter signup (store emails)
- [ ] Email notifications (order confirmation, shipping update)

### Phase 3 — Polish & Scale
- [ ] SEO optimization (structured data, sitemap, robots.txt)
- [ ] Analytics (Google Analytics 4)
- [ ] Performance audit + optimization
- [ ] "See on model" gallery per product
- [ ] Pincode-based delivery estimate
- [ ] Customer reviews/ratings
- [ ] Inventory management (stock tracking)
- [ ] Export orders to CSV
- [ ] Admin dashboard charts (revenue, orders over time)
- [ ] AR try-on (future)

---

## 10. Environment Variables

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# Auth
ADMIN_JWT_SECRET=<random-64-char-string>
NEXTAUTH_SECRET=<random-64-char-string>

# Cloudinary (free tier)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Store
NEXT_PUBLIC_BRAND=SYRA
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD=99900
```

---

## 11. File Structure (Target)

```
src/
├── app/
│   ├── (auth)/           # Login, register, forgot/reset password
│   ├── (store)/          # Public storefront pages
│   │   ├── page.tsx      # Home
│   │   ├── collection/
│   │   ├── products/[slug]/
│   │   ├── checkout/
│   │   ├── confirmation/
│   │   ├── account/
│   │   ├── journal/
│   │   ├── warranty/
│   │   ├── size-guide/
│   │   └── ...
│   ├── admin/            # Admin panel (protected)
│   │   ├── page.tsx      # Dashboard
│   │   ├── products/
│   │   ├── orders/
│   │   ├── content/
│   │   ├── blog/
│   │   ├── coupons/
│   │   ├── banners/
│   │   ├── settings/
│   │   └── login/
│   └── api/              # API routes
│       ├── products/
│       ├── orders/
│       ├── content/
│       ├── banners/
│       ├── blog/
│       ├── coupons/
│       ├── auth/
│       ├── admin/
│       ├── checkout/
│       ├── webhooks/
│       └── upload/
├── components/
│   ├── admin/            # Admin-specific components
│   ├── cart/
│   ├── chrome/           # Nav, footer, WhatsApp button
│   ├── product/
│   ├── search/
│   └── ui/               # Shared UI primitives
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── auth.ts           # Auth helpers
│   ├── cloudinary.ts     # Upload helpers
│   ├── products.ts       # Product queries
│   ├── orders.ts         # Order queries
│   ├── content.ts        # CMS queries
│   └── ...
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed data
│   └── dev.db            # SQLite database file
└── stores/               # Zustand client stores
    ├── cart-store.ts
    ├── auth-store.ts
    ├── wishlist-store.ts
    └── theme-store.ts
```

---

## 12. Admin Panel UI Spec

### Design
- Clean, minimal — white/light background (contrast with dark storefront)
- Sidebar navigation (collapsible on mobile)
- Breadcrumbs on all pages
- Toast notifications for actions (save, delete, error)
- Confirmation modals for destructive actions
- Auto-save drafts

### Key Interactions
- **Image upload:** Click or drag → Cloudinary widget → returns URL → preview
- **Rich text:** Markdown editor with preview (for descriptions, blog posts)
- **Bulk upload:** Drag CSV → parse → preview table → confirm → progress → done
- **Reorder:** Drag-and-drop for banners, gallery images, sections
- **Search:** Quick search in product/order lists
- **Filters:** Status, date range, category filters on lists

---

*Last updated: May 2026*
*Version: 1.0.0*
