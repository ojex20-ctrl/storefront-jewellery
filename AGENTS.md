# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 14 TypeScript storefront. `src/app` contains App Router pages, layouts, and API routes under `src/app/api`. Shared UI lives in `src/components`, domain utilities in `src/lib`, Zustand stores in `src/stores`, and providers in `src/providers`. Prisma schema and seed files are in `prisma/`. Static product, hero, and gift assets are in `public/`. `syra-notifications/` is a separate Express/Prisma email service with its own package, Docker config, and templates.

## Build, Test, and Development Commands

- `npm run dev`: start the Next.js dev server on port `3002`.
- `npm run build`: create a production Next.js build.
- `npm run start`: serve the built app on port `3002`.
- `npm run lint`: run the Next.js ESLint configuration.
- `npm run typecheck`: run TypeScript with `--noEmit`.
- `npm run clean`: remove `.next` and `.turbo` build artifacts.
- `npx prisma db seed`: run the configured `prisma/seed.mjs` seed script.

For the notification service, run commands from `syra-notifications/`, such as `npm run dev`, `npm run db:push`, and `npm run db:seed`.

## Coding Style & Naming Conventions

Use TypeScript and React with 2-space indentation. Prefer the `@/*` import alias. Follow App Router filenames such as `page.tsx`, `layout.tsx`, and `route.ts`. Use PascalCase for component exports and kebab-case filenames for feature clients, for example `product-detail-client.tsx`. Keep server-only logic in `src/lib` or route handlers, and client state in Zustand stores. Tailwind uses the shared `@podium/config/tailwind` preset; match existing component patterns and use Radix or lucide-react where established.

## Testing Guidelines

No dedicated test runner or `npm test` script is currently configured. For every change, run at least `npm run typecheck` and `npm run lint`; run `npm run build` for routing, API, Prisma, or configuration changes. If adding tests, use a clear `*.test.ts` or `*.test.tsx` naming pattern and add the runner script to `package.json`.

## Commit & Pull Request Guidelines

Recent commits use concise, imperative summaries, sometimes with a feature scope, such as `Wishlist: global sync + merge local/server on login`. Keep subjects focused and under 72 characters where practical. Pull requests should describe user-visible changes, list verification commands, link issues, and include screenshots for storefront or admin UI changes. Call out database, environment variable, payment-provider, and notification-service changes explicitly.

## Security & Configuration Tips

Copy `.env.example` to `.env` for setup. Never commit secrets for Stripe, Razorpay, Supabase, Medusa, SMTP, Redis, or databases. Coordinate Prisma schema changes with seed data and deployment migrations.
