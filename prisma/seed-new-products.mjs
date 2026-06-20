/**
 * Seed script: Add new products from the June 2026 product shoot.
 * 
 * Products identified from the images (with de-duplication):
 * 1. Emerald Layered Herringbone Necklace   — 3 angles, same SKU
 * 2. Silver Baguette Tennis Bracelet        — straight + round views
 * 3. Gold Bow Stud Earrings                 — 2 views
 * 4. Gold Classic Tennis Bracelet           — 2 views
 * 5. Gold Double-Rail Cuff Bracelet         — 2 views
 * 6. Gold Triple Starfish Pearl Necklace    — 2 views
 * 7. Pink & White Enamel Bar Bangle         — 2 views
 * 8. Gold Crystal Fleur Statement Earrings  — 2 views
 * 9. Pink Scallop Enamel Bangle             — 2 views
 *
 * Prices are set within the ₹499 / ₹899 / ₹1200 tiers.
 * All prices stored in PAISE (₹1 = 100 paise).
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const products = [
  // ─── NECKLACES ──────────────────────────────────────────────────────────────
  {
    name: "Emerald Layered Herringbone Necklace",
    slug: "emerald-layered-herringbone-necklace",
    caption: "Double the drama, twice the shine.",
    description:
      "A luxurious two-in-one layered necklace featuring a flat herringbone chain paired with a dainty curb chain suspending a bezel-set emerald pendant. 18k gold PVD finish — waterproof, sweat-proof, and anti-tarnish.",
    price: 89900,            // ₹899
    compareAtPrice: 120000,  // ₹1200 strikethrough
    material: "Surgical Steel + 18k Gold PVD",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["Emerald"]),
    sizes: JSON.stringify([]),
    // Multiple angles of same product as gallery
    images: JSON.stringify([
      "/uploads/emerald-herringbone-necklace-1.jpeg",
      "/uploads/emerald-herringbone-necklace-2.jpeg",
      "/uploads/emerald-herringbone-necklace-3.jpeg",
      "/uploads/emerald-herringbone-necklace-4.jpeg",
    ]),
    image: "/uploads/emerald-herringbone-necklace-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/emerald-herringbone-necklace-1.jpeg",
      "/uploads/emerald-herringbone-necklace-2.jpeg",
      "/uploads/emerald-herringbone-necklace-3.jpeg",
      "/uploads/emerald-herringbone-necklace-4.jpeg",
    ]),
    // Classification
    kind: "Necklace",
    kinds: JSON.stringify(["Layered", "Pendant"]),
    mainHierarchies: JSON.stringify(["Necklace"]),
    subHierarchies: JSON.stringify(["Glam Girl Hours"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Trending", "New Arrival", "Gold Finish", "Statement", "Gift Pick"]),
    tag: "NEW",
    published: true,
    featured: true,
    sortOrder: 10,
  },

  {
    name: "Gold Triple Starfish Pearl Necklace",
    slug: "gold-triple-starfish-pearl-necklace",
    caption: "Oceanic charm meets everyday elegance.",
    description:
      "A gold paperclip chain adorned with freshwater pearls and three delicate gold starfish charms — the perfect coastal-luxe necklace. Anti-tarnish PVD coating ensures lasting brilliance.",
    price: 49900,            // ₹499
    compareAtPrice: 89900,   // ₹899 strikethrough
    material: "Surgical Steel + 18k Gold PVD",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["Pearl"]),
    sizes: JSON.stringify([]),
    images: JSON.stringify([
      "/uploads/starfish-pearl-necklace-1.jpeg",
      "/uploads/starfish-pearl-necklace-2.jpeg",
    ]),
    image: "/uploads/starfish-pearl-necklace-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/starfish-pearl-necklace-1.jpeg",
      "/uploads/starfish-pearl-necklace-2.jpeg",
    ]),
    kind: "Necklace",
    kinds: JSON.stringify(["Charm", "Chain"]),
    mainHierarchies: JSON.stringify(["Necklace"]),
    subHierarchies: JSON.stringify(["Everyday Slay"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Daily Wear", "Minimal", "Gold Finish", "Gift Pick", "Under 499"]),
    tag: "BESTSELLER",
    published: true,
    featured: true,
    sortOrder: 11,
  },

  // ─── EARRINGS ────────────────────────────────────────────────────────────────
  {
    name: "Gold Puffy Bow Stud Earrings",
    slug: "gold-puffy-bow-stud-earrings",
    caption: "The bow that never goes out of style.",
    description:
      "Chunky 3D bow-shaped stud earrings in high-polish 18k gold PVD. Bold yet wearable — from campus hallways to date nights. Hypoallergenic surgical steel posts.",
    price: 49900,            // ₹499
    compareAtPrice: 89900,
    material: "Surgical Steel + 18k Gold PVD",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["None"]),
    sizes: JSON.stringify([]),
    images: JSON.stringify([
      "/uploads/gold-bow-earrings-1.jpeg",
      "/uploads/gold-bow-earrings-2.jpeg",
    ]),
    image: "/uploads/gold-bow-earrings-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/gold-bow-earrings-1.jpeg",
      "/uploads/gold-bow-earrings-2.jpeg",
    ]),
    kind: "Earrings",
    kinds: JSON.stringify(["Stud", "Statement"]),
    mainHierarchies: JSON.stringify(["Earrings"]),
    subHierarchies: JSON.stringify(["Bold Babe Edit", "Main Character Campus"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Trending", "Statement", "Gold Finish", "Party Wear", "New Arrival", "Under 499", "Gift Pick"]),
    tag: "NEW",
    published: true,
    featured: true,
    sortOrder: 12,
  },

  {
    name: "Gold Crystal Fleur Drop Earrings",
    slug: "gold-crystal-fleur-drop-earrings",
    caption: "Statement glamour for every occasion.",
    description:
      "Showstopping fleur-de-lis inspired drop earrings with three bezel-set crystals on a baroque gold body. Perfect for weddings, parties, and bold everyday looks. Anti-tarnish 18k gold PVD finish.",
    price: 89900,            // ₹899
    compareAtPrice: 120000,
    material: "Surgical Steel + 18k Gold PVD",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["Crystal"]),
    sizes: JSON.stringify([]),
    images: JSON.stringify([
      "/uploads/gold-crystal-fleur-earrings-1.jpeg",
      "/uploads/gold-crystal-fleur-earrings-2.jpeg",
    ]),
    image: "/uploads/gold-crystal-fleur-earrings-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/gold-crystal-fleur-earrings-1.jpeg",
      "/uploads/gold-crystal-fleur-earrings-2.jpeg",
    ]),
    kind: "Earrings",
    kinds: JSON.stringify(["Drop", "Dangler", "Statement"]),
    mainHierarchies: JSON.stringify(["Earrings"]),
    subHierarchies: JSON.stringify(["Glam Girl Hours", "Bold Babe Edit"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Statement", "Party Wear", "Date Night", "Gold Finish", "Premium Look", "Gift Pick"]),
    tag: "NEW",
    published: true,
    featured: false,
    sortOrder: 13,
  },

  // ─── BRACELETS ───────────────────────────────────────────────────────────────
  {
    name: "Silver Baguette & Round Tennis Bracelet",
    slug: "silver-baguette-round-tennis-bracelet",
    caption: "Baguette brilliance. Every wrist deserves it.",
    description:
      "An alternating baguette and round-cut crystal tennis bracelet in silver-tone white gold PVD. Secure box clasp. Lightweight, anti-tarnish, and built for daily wear.",
    price: 89900,            // ₹899
    compareAtPrice: 120000,
    material: "Surgical Steel + White Gold PVD",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["White Gold", "Silver Finish"]),
    stones: JSON.stringify(["Crystal", "CZ"]),
    sizes: JSON.stringify([]),
    images: JSON.stringify([
      "/uploads/silver-baguette-tennis-bracelet-1.jpeg",
      "/uploads/silver-baguette-tennis-bracelet-2.jpeg",
    ]),
    image: "/uploads/silver-baguette-tennis-bracelet-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/silver-baguette-tennis-bracelet-1.jpeg",
      "/uploads/silver-baguette-tennis-bracelet-2.jpeg",
    ]),
    kind: "Bracelet",
    kinds: JSON.stringify(["Bracelet", "Chain Bracelet"]),
    mainHierarchies: JSON.stringify(["Bracelets"]),
    subHierarchies: JSON.stringify(["Glam Girl Hours", "Boss Babe Basic"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Silver Finish", "Trending", "Party Wear", "Office Wear", "Statement", "Gift Pick"]),
    tag: "BESTSELLER",
    published: true,
    featured: true,
    sortOrder: 14,
  },

  {
    name: "Gold Classic Round Tennis Bracelet",
    slug: "gold-classic-round-tennis-bracelet",
    caption: "The icon. Reborn in anti-tarnish gold.",
    description:
      "Timeless round-cut crystal tennis bracelet in 18k gold PVD. Set in a 4-prong security mount with a double-lock box clasp. Waterproof and sweat-proof for all-day, everyday wear.",
    price: 89900,            // ₹899
    compareAtPrice: 120000,
    material: "Surgical Steel + 18k Gold PVD",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["CZ", "Crystal"]),
    sizes: JSON.stringify([]),
    images: JSON.stringify([
      "/uploads/gold-tennis-bracelet-round-1.jpeg",
      "/uploads/gold-tennis-bracelet-round-2.jpeg",
    ]),
    image: "/uploads/gold-tennis-bracelet-round-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/gold-tennis-bracelet-round-1.jpeg",
      "/uploads/gold-tennis-bracelet-round-2.jpeg",
    ]),
    kind: "Bracelet",
    kinds: JSON.stringify(["Bracelet", "Chain Bracelet", "Stackable"]),
    mainHierarchies: JSON.stringify(["Bracelets"]),
    subHierarchies: JSON.stringify(["Boss Babe Basic", "Everyday Slay"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Daily Wear", "Office Wear", "Trending", "Gold Finish", "Gift Pick", "Premium Look"]),
    tag: "BESTSELLER",
    published: true,
    featured: true,
    sortOrder: 15,
  },

  {
    name: "Gold Double-Rail Open Cuff Bracelet",
    slug: "gold-double-rail-open-cuff-bracelet",
    caption: "Fluid lines. Bold presence.",
    description:
      "An architectural open cuff featuring two parallel smooth gold rails that gently curve to the wrist. Adjustable and one-size-fits-most. Anti-tarnish 18k gold PVD — never fades.",
    price: 49900,            // ₹499
    compareAtPrice: 89900,
    material: "Surgical Steel + 18k Gold PVD",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["None"]),
    sizes: JSON.stringify(["One Size"]),
    images: JSON.stringify([
      "/uploads/gold-double-rail-cuff-1.jpeg",
      "/uploads/gold-double-rail-cuff-2.jpeg",
    ]),
    image: "/uploads/gold-double-rail-cuff-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/gold-double-rail-cuff-1.jpeg",
      "/uploads/gold-double-rail-cuff-2.jpeg",
    ]),
    kind: "Bracelet",
    kinds: JSON.stringify(["Cuff", "Kada", "Adjustable"]),
    mainHierarchies: JSON.stringify(["Bracelets"]),
    subHierarchies: JSON.stringify(["Everyday Slay", "Main Character Campus"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Minimal", "Daily Wear", "Gold Finish", "Under 499", "Lightweight"]),
    tag: null,
    published: true,
    featured: false,
    sortOrder: 16,
  },

  {
    name: "Pink & White Enamel Bar Bangle",
    slug: "pink-white-enamel-bar-bangle",
    caption: "Pastel perfection on your wrist.",
    description:
      "A wide gold bangle with alternating white marble and blush pink enamel bar sections. Hinged clasp for easy wear. Anti-tarnish 18k gold PVD body — a pop of colour that never fades.",
    price: 49900,            // ₹499
    compareAtPrice: 89900,
    material: "Surgical Steel + 18k Gold PVD + Enamel",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["Enamel"]),
    sizes: JSON.stringify([]),
    images: JSON.stringify([
      "/uploads/pink-white-enamel-bangle-1.jpeg",
      "/uploads/pink-white-enamel-bangle-2.jpeg",
    ]),
    image: "/uploads/pink-white-enamel-bangle-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/pink-white-enamel-bangle-1.jpeg",
      "/uploads/pink-white-enamel-bangle-2.jpeg",
    ]),
    kind: "Bracelet",
    kinds: JSON.stringify(["Kada", "Bracelet"]),
    mainHierarchies: JSON.stringify(["Bracelets"]),
    subHierarchies: JSON.stringify(["Main Character Campus", "Everyday Slay"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Daily Wear", "College Wear", "Trending", "Gold Finish", "Gift Pick", "Under 499", "Lightweight", "Skin Friendly"]),
    tag: "NEW",
    published: true,
    featured: true,
    sortOrder: 17,
  },

  {
    name: "Pink Scallop Enamel Stacking Bangle",
    slug: "pink-scallop-enamel-stacking-bangle",
    caption: "Stack it, layer it, love it.",
    description:
      "A slim gold bangle with alternating hot pink and nude enamel scallop segments. Designed for stacking — wear one or stack five. Anti-tarnish PVD finish with hypoallergenic body.",
    price: 49900,            // ₹499
    compareAtPrice: 89900,
    material: "Surgical Steel + 18k Gold PVD + Enamel",
    warranty: "2 Year Anti-Tarnish Guarantee",
    metals: JSON.stringify(["18k Gold"]),
    stones: JSON.stringify(["Enamel"]),
    sizes: JSON.stringify([]),
    images: JSON.stringify([
      "/uploads/pink-scallop-enamel-bangle-1.jpeg",
      "/uploads/pink-scallop-enamel-bangle-2.jpeg",
    ]),
    image: "/uploads/pink-scallop-enamel-bangle-1.jpeg",
    gallery: JSON.stringify([
      "/uploads/pink-scallop-enamel-bangle-1.jpeg",
      "/uploads/pink-scallop-enamel-bangle-2.jpeg",
    ]),
    kind: "Bracelet",
    kinds: JSON.stringify(["Stackable", "Kada", "Bracelet"]),
    mainHierarchies: JSON.stringify(["Bracelets"]),
    subHierarchies: JSON.stringify(["Main Character Campus", "Everyday Slay"]),
    tags: JSON.stringify(["Anti Tarnish", "Waterproof", "Stackable", "Daily Wear", "College Wear", "Trending", "Gold Finish", "Gift Pick", "Under 499", "Lightweight"]),
    tag: null,
    published: true,
    featured: false,
    sortOrder: 18,
  },
]

async function main() {
  console.log(`\nSeeding ${products.length} new products...\n`)

  let created = 0
  let skipped = 0

  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (exists) {
      console.log(`  ⟳  Skipped (already exists): ${p.name}`)
      skipped++
      continue
    }

    await prisma.product.create({
      data: {
        ...p,
        // Keep scalar fields consistent with schema
        modelImages: "[]",
        bundleIds: "[]",
      },
    })
    console.log(`  ✓  Created: ${p.name}  (₹${p.price / 100})`)
    created++
  }

  console.log(`\n✅  Done — ${created} created, ${skipped} skipped.\n`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
