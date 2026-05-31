# SYRA Notifications System

Ecommerce registration + email notification system for SYRA Jewellery.

## What This Does

- User registration with email verification
- Automated order status emails
- WhatsApp click-to-chat (manual, no automation)
- Admin panel to manage users, orders, templates, notifications
- Retry system for failed emails
- Audit logs for all actions

## Quick Deploy on Contabo VPS

### Step 1: Upload to server

```bash
# From your local machine
scp -r syra-notifications root@144.91.102.75:/var/www/syra-notifications
```

### Step 2: SSH into server

```bash
ssh root@144.91.102.75
cd /var/www/syra-notifications
```

### Step 3: Edit environment variables

```bash
cp .env.example .env
nano .env
```

Change these values:
- `DATABASE_URL` — change the password
- `APP_SECRET` — generate with: `openssl rand -hex 32`
- `APP_URL` — your domain or `http://144.91.102.75:4000`
- `BREVO_API_KEY` — get free from https://app.brevo.com (300 emails/day free)
- `EMAIL_FROM` — your sender email
- `ADMIN_PASSWORD` — your admin password
- `DOMAIN` — your domain (for SSL)

### Step 4: Run setup

```bash
chmod +x setup.sh
bash setup.sh
```

### Step 5: SSL (optional, needs a domain)

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d notify.yourdomain.com
docker compose restart nginx
```

## Admin Panel

Access: `http://YOUR_IP:4000/api/admin/login`

Credentials:
- Email: `admin@syra.in`
- Password: `adnan123`

### Admin API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/login` | POST | Admin login |
| `/api/admin/users` | GET | List all users |
| `/api/admin/orders` | GET | List all orders |
| `/api/admin/orders/:id/status` | PUT | Update order status (sends email) |
| `/api/admin/notifications` | GET | View notification logs |
| `/api/admin/templates` | GET | List email templates |
| `/api/admin/templates/:id` | PUT | Edit email template |
| `/api/admin/users/:id/resend-verification` | POST | Resend verification email |
| `/api/admin/audit-logs` | GET | View audit logs |

### User API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/verify?token=xxx` | GET | Verify email |
| `/api/auth/login` | POST | Login |
| `/api/auth/forgot-password` | POST | Request password reset |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/resend-verification` | POST | Resend verification email |
| `/api/orders` | GET | Get my orders |

## WhatsApp

No automation. When admin updates order status, the API returns a `whatsappLink` like:
```
https://wa.me/919876543210?text=Hi%20John%2C%20your%20SYRA%20order%20ORD-001%20status%3A%20shipped
```

Admin clicks this link to open WhatsApp with pre-filled message.

## Email Templates

Templates are HTML files in `/templates/` folder. Placeholders use `{{variable}}` syntax:
- `{{firstName}}` — customer first name
- `{{verifyUrl}}` — verification link
- `{{resetUrl}}` — password reset link
- `{{orderNumber}}` — order number
- `{{status}}` — order status

Edit templates from admin panel or directly in the files.

## Backup

```bash
# Manual backup
docker compose exec app node scripts/backup.js

# Restore
docker compose exec -T db psql -U syra syra_notifications < backups/backup-FILE.sql
```

## Get Brevo API Key (Free)

1. Go to https://app.brevo.com
2. Sign up (free)
3. Go to SMTP & API → API Keys
4. Create a new key
5. Copy it to your `.env` as `BREVO_API_KEY`

Free tier: 300 emails/day — enough for most small stores.

## Order Statuses

When admin changes status, email is sent automatically:
- `placed` — Order placed
- `payment_success` — Payment confirmed
- `packed` — Order packed
- `shipped` — Order shipped
- `out_for_delivery` — Out for delivery
- `delivered` — Delivered
- `cancelled` — Cancelled
- `refund_initiated` — Refund started
- `refund_completed` — Refund done
