# SYRA Storefront

SYRA is a Next.js 14 ecommerce storefront for anti-tarnish jewellery. The same app serves the public storefront, customer account area, admin dashboard, and API routes. Data is stored in MongoDB through Prisma, with local/admin configuration stored in the `Setting` model.

## Documentation Map

- [AGENTS.md](AGENTS.md): concise contributor guide. This file already existed and has not been modified.
- [docs/LOCAL_SETUP.md](docs/LOCAL_SETUP.md): local installation, environment variables, database setup, and troubleshooting.
- [docs/TECHNICAL_REFERENCE.md](docs/TECHNICAL_REFERENCE.md): architecture, route map, data model, auth, payment, media, and UI notes.
- [docs/BUSINESS_OPERATIONS.md](docs/BUSINESS_OPERATIONS.md): ecommerce behavior, admin workflows, order lifecycle, and business rules.
- [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md): production checklist, deploy flow, payment webhook setup, rollback, and smoke tests.
- [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md): instructions for other AI agents making code changes safely.
- [BULK-UPLOAD-GUIDE.md](BULK-UPLOAD-GUIDE.md): product import reference.
- [REQUIREMENTS.md](REQUIREMENTS.md): historical product requirements; use the current docs above for implementation truth.

## Quick Start

Use Node.js 20+ and pnpm. This package references workspace packages `@podium/ui` and `@podium/config`, so a fresh checkout must have those workspace packages available or linked.

```bash
cp .env.example .env
pnpm install
pnpm exec prisma generate
pnpm exec prisma db push
pnpm exec prisma db seed
pnpm run dev
```

The storefront runs at `http://localhost:3002`. Admin login is at `/admin/login`.

## Common Commands

```bash
pnpm run dev        # local Next.js server on port 3002
pnpm run typecheck  # TypeScript validation
pnpm run lint       # Next.js ESLint
pnpm run build      # production build
pnpm run start      # serve the built app on 127.0.0.1:3002
pnpm run clean      # remove .next and .turbo
```

## Production Summary

Current production domain: `https://syrathelabel.com`.

The app is deployed as a PM2-managed Next.js app. Production secrets live in server environment files and admin settings, not in git. See [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) before deploying.

## Security Rules

Never commit `.env`, payment keys, Google OAuth secrets, SMTP passwords, database URLs, uploaded product images, or server passwords. Use the admin settings screen for configurable store values and keep secrets in environment variables or the database `Setting` records.
