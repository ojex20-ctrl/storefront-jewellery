# Local Setup

This guide explains how to run the SYRA storefront on a developer machine.

## Prerequisites

- Node.js 20 or newer.
- pnpm 9 or newer.
- MongoDB with a replica set enabled. Prisma MongoDB transactions require `?replicaSet=...`.
- Access to the workspace packages `@podium/ui` and `@podium/config`.

If this repository is checked out alone, `pnpm install` can fail because `package.json` uses `workspace:*` dependencies. Run it inside the parent Podium workspace or link/provide the two workspace packages.

## Environment

Copy the example file and fill in local values:

```bash
cp .env.example .env
```

Required for normal development:

- `DATABASE_URL`: MongoDB connection string, for example `mongodb://127.0.0.1:27017/syra?replicaSet=rs0`.
- `ADMIN_JWT_SECRET`: random admin JWT secret.
- `NEXTAUTH_SECRET`: random customer JWT secret.

Optional but useful:

- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- `MEDIA_ROOT`: absolute upload path. Leave blank locally to use `public/uploads`.

Generate secrets with:

```bash
openssl rand -hex 32
```

## Local MongoDB

One simple Docker option:

```bash
docker run --name syra-mongo -p 27017:27017 -d mongo:7 --replSet rs0 --bind_ip_all
docker exec syra-mongo mongosh --eval 'rs.initiate()'
```

Then use:

```bash
DATABASE_URL=mongodb://127.0.0.1:27017/syra?replicaSet=rs0
```

## Install And Initialize

```bash
pnpm install
pnpm exec prisma generate
pnpm exec prisma db push
pnpm exec prisma db seed
```

The seed only creates an admin user when `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` are set. Do not hardcode shared passwords in docs or source.

## Run The Storefront

```bash
pnpm run dev
```

Open:

- Storefront: `http://localhost:3002`
- Admin: `http://localhost:3002/admin/login`
- Account: `http://localhost:3002/account`
- Collection: `http://localhost:3002/collection`

## Notification Service

`syra-notifications/` is a separate Express service for email and notification workflows.

```bash
cd syra-notifications
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Use its README for service-specific Docker, Redis, and template details. Do not reuse sample credentials in production.

## Validation

Run these before committing application changes:

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
```

For docs-only changes, at minimum run:

```bash
git diff --check
```

## Troubleshooting

- Missing `@podium/ui` or `@podium/config`: run inside the parent workspace or link the packages.
- Prisma MongoDB errors about transactions: confirm the MongoDB URL includes `replicaSet=rs0` and the replica set is initiated.
- Admin auth fails immediately: confirm `ADMIN_JWT_SECRET` is set.
- Customer auth or Google login fails: confirm `NEXTAUTH_SECRET` and Google OAuth redirect URLs.
- Uploaded images disappear after deploy: ensure production uses `MEDIA_ROOT` outside the code tree and nginx serves it at `/uploads`.
