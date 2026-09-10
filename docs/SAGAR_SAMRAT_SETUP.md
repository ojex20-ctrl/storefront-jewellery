# Sagar Samrat

Editable copy of the SYRA storefront with its own shared packages.
The existing design and content are preserved for future customization.

## Folder structure

```text
src/app/             Pages, layouts, admin screens, and API routes
src/components/      Storefront components
src/lib/             Brand defaults, product data, and utilities
src/stores/          Cart and other client state
public/              Images, logos, and static assets
docs/                Project documentation
packages/ui/         Independent shared UI source
packages/config/     Independent build and styling configuration
prisma/              Database schema and seed source
syra-notifications/  Original notification service for adaptation
```

## Local development

Run from this folder:

```powershell
pnpm install
pnpm exec prisma generate
pnpm run dev
```

Open http://localhost:3003. The original SYRA site uses port 3002.
Prisma generation does not modify a database. Database-backed features need
their own configuration. Do not run local database schema changes or seeds.

## Customization

Edit pages in src/app, components in src/components, and images in public.
Brand defaults and mock product data are in src/lib. SYRA references in pages,
metadata, policies, emails, and integrations remain to be adapted to new content.
The example environment configuration is not an active database connection.

The copied Git history retains the original remote. Configure a new remote
before publishing this project. Existing deployment docs describe SYRA and
are reference material, not deployment settings for Sagar Samrat.

## Verification

```powershell
pnpm run typecheck
pnpm run lint
pnpm run build
```
