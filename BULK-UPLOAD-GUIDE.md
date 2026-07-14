# SYRA — Bulk Product & Category Upload Guide

## Overview

Your admin panel at `/admin` has a built-in bulk upload system. You can upload products via CSV or JSON through the API.

---

## Method 1: Admin Panel (Recommended)

1. Go to `http://localhost:3002/admin/login` (or your live URL `/admin/login`)
2. Login with an active admin account provided through a secure channel.
3. Navigate to **Products** section
4. Use the "Add Product" form for individual products
5. For bulk: use the API method below

---

## Method 2: Bulk Upload via API

### Endpoint
```
POST /api/admin/products/bulk
```

### Authentication
You must be logged in as admin (cookie-based auth). Use the login endpoint first:

```bash
# Step 1: Login and get cookie
curl -X POST http://localhost:3002/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ADMIN_EMAIL","password":"ADMIN_PASSWORD"}' \
  -c cookies.txt

# Step 2: Bulk upload products
curl -X POST http://localhost:3002/api/admin/products/bulk \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d @products.json
```

### JSON Format

```json
{
  "products": [
    {
      "name": "Gold Plated Anti Tarnish Heart Bracelet",
      "slug": "gold-heart-bracelet",
      "kind": "Bracelet",
      "price": "46900",
      "caption": "Elegant heart-themed wraparound bracelet",
      "description": "18k gold plated anti-tarnish bracelet with heart motif. Waterproof and hypoallergenic.",
      "metals": "18k Gold;Rose Gold",
      "stones": "None",
      "sizes": "S;M;L",
      "image": "https://your-cdn.com/bracelet-1.jpg",
      "gallery": "https://your-cdn.com/bracelet-1.jpg;https://your-cdn.com/bracelet-1b.jpg",
      "tag": "BESTSELLER",
      "material": "Surgical Steel + 18k Gold PVD",
      "warranty": "2 Year Anti-Tarnish Guarantee"
    },
    {
      "name": "Rose Gold Crystal Drop Earrings",
      "slug": "rose-gold-crystal-drops",
      "kind": "Earrings",
      "price": "69900",
      "caption": "Sparkling crystal drops in rose gold",
      "description": "Anti-tarnish rose gold plated earrings with Austrian crystal drops.",
      "metals": "Rose Gold",
      "stones": "Diamond",
      "sizes": "",
      "image": "https://your-cdn.com/earrings-1.jpg",
      "gallery": "https://your-cdn.com/earrings-1.jpg;https://your-cdn.com/earrings-1b.jpg",
      "tag": "NEW",
      "material": "Rose Gold PVD + Crystal",
      "warranty": "2 Year Anti-Tarnish Guarantee"
    }
  ]
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Product name |
| `slug` | ❌ | URL slug (auto-generated from name if empty) |
| `kind` | ✅ | Category: `Ring`, `Necklace`, `Earrings`, `Bracelet`, `Nose ring` |
| `price` | ✅ | Price in **paise** (₹469 = `46900`) |
| `caption` | ❌ | Short one-liner |
| `description` | ❌ | Full product description |
| `metals` | ❌ | Semicolon-separated: `18k Gold;Rose Gold;White Gold;Sterling` |
| `stones` | ❌ | Semicolon-separated: `Diamond;Sapphire;Emerald;Onyx;Pearl;None` |
| `sizes` | ❌ | Semicolon-separated: `6;7;8` or `S;M;L` |
| `image` | ❌ | Main product image URL |
| `gallery` | ❌ | Semicolon-separated image URLs |
| `tag` | ❌ | One of: `BESTSELLER`, `NEW`, `ONE OF ONE`, `LOW STOCK`, `SALE` |
| `material` | ❌ | Material description |
| `warranty` | ❌ | Warranty text |

### Download CSV Template

```bash
curl http://localhost:3002/api/admin/products/bulk \
  -b cookies.txt \
  -o products-template.csv
```

---

## Method 3: Direct Database Seed

For initial setup, you can use the Prisma seed script:

```bash
# Edit prisma/seed.mjs with your products, then run:
npx prisma db seed
```

---

## Categories

Categories are managed via the `Category` model. Add them via the admin panel or directly:

```bash
curl -X POST http://localhost:3002/api/admin/products/bulk \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "products": [
      {"name": "Sample Ring", "kind": "Ring", "price": "49900", "tag": "NEW"},
      {"name": "Sample Earring", "kind": "Earrings", "price": "39900", "tag": "BESTSELLER"},
      {"name": "Sample Necklace", "kind": "Necklace", "price": "59900"},
      {"name": "Sample Bracelet", "kind": "Bracelet", "price": "44900", "tag": "NEW"}
    ]
  }'
```

The `kind` field IS the category. Products are filtered by kind on the collection page:
- `/collection?kind=Ring` → Shows all rings
- `/collection?kind=Earrings` → Shows all earrings
- `/collection?kind=Necklace` → Shows all necklaces
- `/collection?kind=Bracelet` → Shows all bracelets

---

## Image Hosting

For product images, you can:
1. Place them in `/public/products/` and reference as `/products/filename.jpg`
2. Use a CDN like Cloudinary (set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env`)
3. Use any public URL

---

## Quick Start: Upload 10 Products

Save this as `products.json` and run the curl command above:

```json
{
  "products": [
    {"name": "Celestial Moon Ring", "kind": "Ring", "price": "59900", "metals": "18k Gold;White Gold", "stones": "Diamond", "sizes": "6;7;8;9", "tag": "BESTSELLER", "image": "/jewellery/gen-diamond-ring.png"},
    {"name": "Aurora Hoop Earrings", "kind": "Earrings", "price": "49900", "metals": "Rose Gold", "stones": "None", "tag": "NEW", "image": "/jewellery/gen-crystal-earrings.png"},
    {"name": "Serpentine Chain Bracelet", "kind": "Bracelet", "price": "69900", "metals": "18k Gold", "stones": "None", "sizes": "S;M;L", "image": "/jewellery/gen-gold-bracelet.png"},
    {"name": "Teardrop Pendant Necklace", "kind": "Necklace", "price": "79900", "metals": "Sterling;White Gold", "stones": "Sapphire", "tag": "ONE OF ONE", "image": "/jewellery/gen-gold-necklace.png"},
    {"name": "Pink Heart Solitaire Ring", "kind": "Ring", "price": "44900", "metals": "Rose Gold", "stones": "Diamond", "sizes": "5;6;7;8", "image": "/jewellery/gen-pink-heart-ring.png"},
    {"name": "Ruby Cascade Drops", "kind": "Earrings", "price": "89900", "metals": "18k Gold", "stones": "Emerald", "tag": "BESTSELLER", "image": "/jewellery/gen-ruby-earrings.png"},
    {"name": "Sapphire Eternity Band", "kind": "Ring", "price": "99900", "metals": "White Gold", "stones": "Sapphire", "sizes": "6;7;8", "tag": "NEW", "image": "/jewellery/gen-sapphire-ring.png"},
    {"name": "Gold Bar Pendant", "kind": "Necklace", "price": "129900", "metals": "18k Gold", "stones": "None", "image": "/jewellery/gen-gold-bar.png"},
    {"name": "Twisted Rope Bracelet", "kind": "Bracelet", "price": "54900", "metals": "Rose Gold;18k Gold", "stones": "Pearl", "sizes": "S;M;L", "image": "/jewellery/gen-gold-bracelet.png"},
    {"name": "Diamond Cluster Studs", "kind": "Earrings", "price": "74900", "metals": "White Gold", "stones": "Diamond", "tag": "BESTSELLER", "image": "/jewellery/gen-crystal-earrings.png"}
  ]
}
```
