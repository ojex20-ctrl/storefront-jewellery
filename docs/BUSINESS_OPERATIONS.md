# Business Operations

## Brand And Store Positioning

SYRA sells premium anti-tarnish jewellery for the Indian market. The storefront emphasizes waterproof, sweat-proof, hypoallergenic, everyday-wear pieces with a luxury visual style.

Primary product categories are rings, earrings, necklaces, and bracelets. The schema also supports nose rings, anklets, subcategories, metals, stones, sizes, tags, bundles, model images, warranty text, SEO fields, and featured sorting.

## Customer Journey

1. Customer lands on the home page and browses featured content, dynamic jewellery motion, banners, and product sections.
2. Customer searches through the popup search or full `/search` page.
3. Customer filters collections by product type and opens a product detail page.
4. Customer can use wishlist, compare products, recommendations, recently viewed products, reviews, and back-in-stock capture.
5. Customer adds items to cart, enters checkout details, optionally applies a coupon, selects shipping, and pays with Razorpay.
6. Customer receives confirmation, can track the order, and can view order history from the account area.

## Admin Workflows

Admin dashboard: `/admin/login`.

Main sections:

- Products: create, edit, publish, feature, sort, upload media, and bulk upload products.
- Collections: category and collection management.
- Orders: view order details, payment status, customer details, item snapshots, tracking data, and update fulfillment status.
- Customers: customer profiles and order/account context.
- Coupons: discount code setup and usage limits.
- Inbox: contact, bespoke, atelier, and rental inquiries.
- Content and banners: CMS sections and storefront hero/mid-page banners.
- Media: gallery and uploaded assets.
- Settings: brand, shipping, payment gateways, SEO, footer, social links, announcement bar, navigation JSON, and integration status.

## Money And Pricing

All application money values are stored in paise. Examples:

- INR 499.00 is stored as `49900`.
- INR 49.00 shipping is stored as `4900`.
- Percentage coupons calculate against subtotal and are capped at subtotal.

Never trust client totals. `/api/checkout` recomputes subtotal, shipping, coupon discount, and total before creating the order.

## Order Lifecycle

- `placed`: order record exists, payment may still be pending.
- `confirmed`: payment is captured or the order has been manually validated.
- `packed`: items are packed.
- `shipped`: courier handoff complete.
- `out_for_delivery`: courier is attempting delivery.
- `delivered`: customer received the order.
- `cancelled`: order is not being fulfilled.

Payment lifecycle:

- `pending`: payment not completed.
- `paid`: payment captured and revenue can be counted.
- `failed`: payment attempt failed or was cancelled.
- `refunded`: refund processed.

Order status changes create `OrderStatusHistory` records and attempt status emails.

## Payments

Razorpay is the primary gateway. Test or live behavior is controlled by the Razorpay key pair, not only by the UI label. Configure the key ID, key secret, webhook secret, currency, theme color, and endpoint overrides in admin settings or environment variables.

Razorpay webhooks should subscribe to:

- `payment.captured`
- `payment.failed`

Webhook URL:

```text
https://syrathelabel.com/api/webhooks/razorpay
```

Stripe code exists but should be treated as secondary until it is fully configured and tested.

## Reviews

Only logged-in customers who purchased a product should be able to submit a verified review. Reviews are stored against the product slug and can be approved or hidden through admin controls when implemented.

## Product Data Quality

Before publishing products, confirm:

- Name, slug, kind, price, image, and description are present.
- Main image and gallery URLs resolve.
- Product type matches the collection filters.
- Metals, stones, sizes, material, warranty, SEO title, and SEO description are filled where relevant.
- Published products do not use blank images.
- Compare price is greater than sale price when present.

## Customer Support

Customers can use contact forms, account order history, order tracking, WhatsApp links, and transactional emails. Admins should keep tracking number and tracking URL updated for shipped orders.

## Reporting

Dashboard revenue should count only paid orders. Pending, failed, or cancelled unpaid orders are operational leads, not revenue. Useful reports are paid revenue, paid order count, average order value, top products, coupon usage, abandoned checkout count, failed payments, and new customer count.

## Data Cleanup

When refreshing the database, preserve products, categories, content, banners, and settings unless the owner explicitly requests a full reset. Customer accounts, addresses, wishlists, unpaid test orders, OTPs, and reset tokens can be cleared for a fresh production launch only after a backup.
