# Technical Reference

## Stack

- Next.js 14 App Router, React 18, TypeScript.
- Tailwind CSS through `@podium/config/tailwind`.
- Shared primitives and motion helpers from `@podium/ui`.
- Prisma Client with MongoDB.
- Zustand for browser state.
- Razorpay and Stripe payment code, with Razorpay currently the primary checkout.
- Framer Motion, GSAP, Three.js, and React Three Fiber for interactive UI.

## Repository Structure

- `src/app`: pages, layouts, route handlers, and page-specific clients.
- `src/app/api`: API routes for auth, admin, checkout, payments, reviews, search, account, and webhooks.
- `src/components`: reusable chrome, product, commerce, admin, media, search, marketing, 3D, and UI components.
- `src/lib`: server/domain utilities for auth, payment, settings, orders, products, email, navigation, and data access.
- `src/stores`: Zustand stores for cart, auth, theme, wishlist, compare, orders, marketing, and recently viewed products.
- `src/providers`: app-level providers such as theme and smooth scrolling.
- `prisma`: MongoDB schema and seed scripts.
- `public`: committed static assets for hero images, jewellery images, gifts, and product placeholders.
- `syra-notifications`: separate Express notification service.

## Route Map

Public storefront routes include `/`, `/collection`, `/collection/[category]`, `/products/[id]`, `/search`, `/cart`, `/checkout`, `/confirmation/[orderId]`, `/payment-failed/[orderId]`, `/order-track`, legal/help pages, `/journal`, `/contact`, `/atelier`, `/bespoke`, and `/rentals`.

Customer routes live under `/account` and include dashboard, profile, addresses, orders, wishlist, login/register, OTP verification, password reset, and logout.

Admin routes live under `/admin` and include dashboard, products, bulk upload, collections, orders, customers, coupons, inbox, content, banners, media, settings, integrations, login, and logout.

## Data Model

The Prisma datasource is MongoDB. Important models:

- `Product`: catalogue items. Prices are integers in paise. Product images are stored as URL strings and JSON arrays.
- `Category`: collection/category metadata.
- `Order`: checkout snapshot, customer details, totals, payment fields, tracking, and gift fields.
- `OrderStatusHistory`: audit trail for admin status changes.
- `Customer`, `CustomerAddress`, `Wishlist`: account, address book, and saved products.
- `AdminUser`: admin dashboard users.
- `Setting`: runtime store, shipping, SEO, social, payment, and advanced configuration.
- `Review`: product reviews. `verified` means the customer purchased the product.
- `Coupon`, `Banner`, `SiteContent`, `BlogPost`, `InstagramFeedItem`, `NewsletterSubscriber`, `ContactMessage`, `BackInStockSubscription`, `Otp`, token models.

JSON-like fields are stored as strings. Use existing helpers in `src/lib` instead of ad hoc parsing.

## Configuration Flow

`.env` provides server secrets and fallback values. Runtime store settings are read from the `Setting` model by `src/lib/brand-config.ts` and `src/lib/payment-settings.ts`.

Configurable admin settings include brand name, tagline, logo URL, accent color, contact details, WhatsApp, social links, shipping rates, payment gateway parameters, announcement bar, SEO, footer copy, navigation JSON, Instagram feed JSON, Razorpay mode, Razorpay key IDs/secrets, Razorpay webhook secret, and advanced Razorpay endpoint URLs.

Secret settings are sanitized before they are returned to the client. Blank secret fields in admin settings mean "keep the existing configured value".

## Authentication

Admin sessions use the `syra_admin_token` cookie and `ADMIN_JWT_SECRET`. Customer sessions use the `syra_customer_token` cookie and `NEXTAUTH_SECRET`.

Customer auth supports local email/password, OTP flows, reset tokens, and Google OAuth. Google-only customers use a non-local password marker, so password reset/change screens should only be shown when the customer has a local password hash.

## Checkout And Payment

Checkout creates an internal `Order` with `status=placed` and `paymentStatus=pending`. The browser then opens Razorpay via `src/lib/razorpay.ts`.

Razorpay server flow:

1. `/api/payments/razorpay/create-order` creates the Razorpay order.
2. Razorpay checkout completes or fails in the browser.
3. `/api/payments/razorpay/verify` verifies successful signatures and marks the order `paymentStatus=paid`, `status=confirmed`.
4. `/api/payments/razorpay/failure` records failed payment attempts.
5. `/api/webhooks/razorpay` also handles `payment.captured` and `payment.failed` using the webhook signature.

Revenue dashboards should use only `paymentStatus=paid`.

## Order Statuses

Valid order statuses are `placed`, `confirmed`, `packed`, `shipped`, `out_for_delivery`, `delivered`, and `cancelled`.

Valid payment statuses are `pending`, `paid`, `failed`, and `refunded`.

`placed` means checkout created the order record. `confirmed` means payment is captured or the admin has confirmed a valid order. Do not treat unpaid `placed` orders as revenue.

## Media

Committed assets live in `public/`. Uploaded product media should live outside the code tree using `MEDIA_ROOT` and be served at `/uploads`. This prevents deploys from deleting uploaded images.

When fixing missing product images, first reuse existing committed or uploaded images where the product type matches. Avoid leaving blank image strings on published products.

## UI And State

Use the shared chrome components for navigation, search, account, theme, cart drawer, and WhatsApp. Keep admin navigation centralized in `src/lib/navigation.ts` and `src/components/admin/sidebar.tsx`.

Theme state is in `src/stores/theme-store.ts`. Cart, wishlist, compare, recently viewed, marketing, order, and auth client state live in their matching stores.

Use Tailwind utility patterns already present in the codebase. Keep color contrast readable in both dark and light themes.

## Supporting Services

The main Next.js app already sends important transactional emails through `src/lib/email.ts`. `syra-notifications/` is a separate service for richer notification workflows and templates. Treat it as a separate deployable service with its own environment and database.
