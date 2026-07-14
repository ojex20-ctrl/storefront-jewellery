# Production Deployment

## Current Production

- Domain: `https://syrathelabel.com`
- App type: Next.js app managed by PM2.
- App name in PM2: `syra-jewellery`.
- Production app directory: `/var/www/podium/apps/storefront-jewellery`.
- Production media should live outside the source tree, for example under `/var/www/syra-media`, and be served as `/uploads`.

Do not store SSH passwords, `.env`, payment secrets, or database credentials in git.

## Pre-Deployment Checklist

1. Confirm the local worktree only contains intended changes.
2. Review diffs for secrets.
3. Run validation:

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
```

4. If Prisma schema changed, plan a database backup and `pnpm exec prisma db push`.
5. If payment, auth, or checkout changed, test with Razorpay test credentials before live use.
6. If UI changed, check mobile, tablet, and desktop viewports.

## Deploy Flow

The production server is not the git source of truth. Deploy exact changed files, validate, then commit and push the repository.

Example file-copy deployment:

```bash
git diff --name-only > /tmp/syra-files.txt
tar -czf /tmp/syra-deploy.tgz -T /tmp/syra-files.txt
scp /tmp/syra-deploy.tgz root@SERVER_HOST:/tmp/syra-deploy.tgz
ssh root@SERVER_HOST
```

On the server:

```bash
cd /var/www/podium/apps/storefront-jewellery
tar -czf /var/www/podium-app-backups/source-before-syra-$(date +%Y%m%d%H%M%S).tgz .
tar -xzf /tmp/syra-deploy.tgz
pnpm exec prisma generate
pnpm exec tsc --noEmit --incremental false
pnpm run build
pm2 restart syra-jewellery
```

If `prisma/schema.prisma` changed, also run:

```bash
pnpm exec prisma db push
```

Use `db push` carefully on production MongoDB and only after backup.

## Smoke Tests

After restart:

```bash
curl -L -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://syrathelabel.com/
curl -L -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://syrathelabel.com/collection
curl -L -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://syrathelabel.com/search
curl -L -s -o /dev/null -w "%{http_code} %{url_effective}\n" https://syrathelabel.com/admin/login
```

For payment changes, place a Razorpay test order and confirm:

- Order is created as `placed` and `pending`.
- Successful payment changes it to `confirmed` and `paid`.
- Failed payment records gateway details and shows the failure page.
- Admin dashboard revenue counts only paid orders.

## Production Environment

Required:

- `DATABASE_URL`
- `ADMIN_JWT_SECRET`
- `NEXTAUTH_SECRET`

Payment:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` when needed by older code paths
- Stripe keys only if Stripe is enabled

Auth and messaging:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `ADMIN_ORDER_ALERT_EMAIL`

Media and support:

- `MEDIA_ROOT`
- `PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `PUBLIC_INSTAGRAM_URL`

## Razorpay Dashboard Setup

Use the same mode as the configured key pair.

- Webhook URL: `https://syrathelabel.com/api/webhooks/razorpay`
- Events: `payment.captured`, `payment.failed`
- Secret: same value as `RAZORPAY_WEBHOOK_SECRET` or admin setting `payment_razorpay_webhook_secret`

Razorpay test card behavior is controlled by Razorpay. If a card fails with an international-card message, use Razorpay India test card numbers from the Razorpay dashboard/docs and confirm the test account supports the scenario.

## Google OAuth Setup

Authorized redirect URI:

```text
https://syrathelabel.com/api/auth/google/callback
```

Use a separate OAuth client for local development if possible:

```text
http://localhost:3002/api/auth/google/callback
```

## Logs And Debugging

On production:

```bash
pm2 status
pm2 logs syra-jewellery
```

Useful checks:

- Admin login failures: verify `ADMIN_JWT_SECRET` and admin user record.
- Customer session failures: verify `NEXTAUTH_SECRET`.
- Payment failures: inspect `/api/payments/razorpay/failure`, Razorpay dashboard event logs, and PM2 logs.
- Webhook failures: confirm webhook secret and `x-razorpay-signature`.
- Missing images: check `MEDIA_ROOT`, nginx `/uploads` alias, and product image URLs.

## Rollback

If deployment fails before restart, restore the backup archive created in `/var/www/podium-app-backups`. If the app restarted and breaks production, restore source, rebuild, and restart PM2:

```bash
cd /var/www/podium/apps/storefront-jewellery
tar -xzf /var/www/podium-app-backups/source-before-syra-TIMESTAMP.tgz
pnpm run build
pm2 restart syra-jewellery
```

If database changes were applied, restore from the database backup rather than only restoring files.
