# AI Handoff Guide

Use this when another AI agent needs to understand or modify the project.

## First Files To Read

1. `README.md`
2. `AGENTS.md`
3. `docs/LOCAL_SETUP.md`
4. `docs/TECHNICAL_REFERENCE.md`
5. `docs/BUSINESS_OPERATIONS.md`
6. `docs/PRODUCTION_DEPLOYMENT.md`
7. `prisma/schema.prisma`
8. `package.json`

`REQUIREMENTS.md` is historical. Prefer the current docs and source code when they disagree.

## Rules For Changes

- Do not commit `.env`, secrets, uploaded images, archives, or production credentials.
- Keep `AGENTS.md` unchanged unless the owner specifically asks to update it.
- Use `rg` to search code.
- Prefer existing modules in `src/lib`, `src/components`, and `src/stores`.
- Keep storefront navigation centralized in `src/lib/navigation.ts`.
- Keep admin sidebar links centralized in `src/lib/navigation.ts` and `src/components/admin/sidebar.tsx`.
- Use Prisma through `src/lib/db.ts`.
- Use `@/*` imports for app code.
- Preserve dark/light theme support.
- Keep mobile, tablet, and desktop layouts readable and non-overlapping.

## Business Invariants

- Prices and totals are in paise.
- Revenue is paid orders only.
- `placed` plus `pending` is not revenue.
- A paid order should become `confirmed`.
- Customer reviews should be tied to an authorized purchase.
- Google-only customers should not be shown password-change/reset actions.
- Published products should always have a usable image.
- Payment gateway parameters must remain configurable from admin settings or environment variables.

## Common Change Areas

- Home page: `src/app/_home/home-client.tsx`
- Product card: `src/components/product/product-card.tsx`
- Product detail: `src/app/products/[id]/product-detail-client.tsx`
- Search modal: `src/components/search/search-modal.tsx`
- Search page: `src/app/search/search-client.tsx`
- Navigation: `src/lib/navigation.ts`, `src/components/chrome/site-chrome.tsx`
- Account menu: `src/components/chrome/account-menu.tsx`
- Cart: `src/stores/cart-store.ts`, `src/components/cart/cart-drawer.tsx`, `src/app/cart/cart-client.tsx`
- Checkout: `src/app/checkout/checkout-client.tsx`, `src/app/api/checkout/route.ts`
- Razorpay: `src/lib/razorpay.ts`, `src/lib/razorpay-server.ts`, `src/app/api/payments/razorpay/*`, `src/app/api/webhooks/razorpay/route.ts`
- Admin settings: `src/app/admin/settings/settings-client.tsx`, `src/app/api/admin/settings/route.ts`
- Order status: `src/lib/order-status.ts`, `src/app/admin/orders/[id]/status-changer.tsx`
- Images/media: `src/app/api/admin/media/route.ts`, `public/`, `MEDIA_ROOT`

## Validation Before Final Answer

For code changes:

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
```

For production changes:

```bash
pm2 restart syra-jewellery
curl -L -s -o /dev/null -w "%{http_code}\n" https://syrathelabel.com/
curl -L -s -o /dev/null -w "%{http_code}\n" https://syrathelabel.com/collection
curl -L -s -o /dev/null -w "%{http_code}\n" https://syrathelabel.com/search
curl -L -s -o /dev/null -w "%{http_code}\n" https://syrathelabel.com/admin/login
```

For docs-only changes:

```bash
git diff --check
```

## Production Safety

The production server can contain user data, orders, payment records, uploaded images, and admin settings. Before destructive database actions, create a backup and confirm the owner asked for that exact cleanup. Keep products and product details unless explicitly instructed otherwise.
