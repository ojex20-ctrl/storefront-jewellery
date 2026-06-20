import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hash = await bcrypt.hash("admin123", 12)
  await prisma.adminUser.upsert({
    where: { email: "adnan@syra.com" },
    update: {},
    create: {
      email: "adnan@syra.com",
      passwordHash: hash,
      name: "Adnan Admin",
      role: "superadmin",
    },
  })
  console.log("✓ Admin user created: adnan@syra.com / admin123")

  // Seed products from mock data
  const products = [
    { name: "Classic Aurelia Band", slug: "syra-ring-01", kind: "Ring", caption: "The essence of minimalist luxury.", price: 12000, metals: '["18k Gold","White Gold"]', stones: '["Diamond"]', sizes: '["6","7","8"]', tag: "BESTSELLER", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1603561591411-0e7320b97d17?auto=format&fit=crop&q=80&w=800"]', description: "A timeless 18k gold band featuring a single hand-set diamond. Engineered with PVD anti-tarnish technology for daily wear.", material: "Surgical Steel + 18k Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Luna Pearl Drop", slug: "syra-necklace-01", kind: "Necklace", caption: "A whisper of elegance.", price: 18500, metals: '["18k Gold"]', stones: '["Pearl"]', sizes: '[]', tag: "NEW", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800","https://images.unsplash.com/photo-1611085583191-a3b1a20a7931?auto=format&fit=crop&q=80&w=800"]', description: "Ethically sourced pearls suspended from a delicate anti-tarnish gold chain. Waterproof and sweat-proof.", material: "Surgical Steel + 18k Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Minimalist Nose Stud", slug: "syra-nose-01", kind: "Nose Ring", caption: "Subtle. Sophisticated.", price: 4500, metals: '["Sterling","18k Gold"]', stones: '["Diamond"]', sizes: '[]', tag: null, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"]', description: "A surgical-grade nose stud designed for comfort and longevity. Hypoallergenic and anti-tarnish.", material: "Surgical Steel + 18k Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Solstice Cuff", slug: "syra-bracelet-01", kind: "Bracelet", caption: "Heirloom in the making.", price: 24000, metals: '["18k Gold","Rose Gold"]', stones: '["None"]', sizes: '[]', tag: "ONE OF ONE", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"]', description: "Hand-finished 18k rose gold cuff. Sleek, minimal, and engineered for a lifetime of brilliance.", material: "Surgical Steel + Rose Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Astra Diamond Studs", slug: "syra-earring-01", kind: "Earrings", caption: "Celestial brilliance.", price: 9500, metals: '["White Gold","Sterling"]', stones: '["Diamond"]', sizes: '[]', tag: null, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"]', description: "Brilliant-cut diamonds set in a minimal four-prong white gold mount. Perfect for everyday luxury.", material: "Surgical Steel + White Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Onyx Sovereign Ring", slug: "syra-ring-02", kind: "Ring", caption: "Bold. Timeless.", price: 15000, metals: '["18k Gold"]', stones: '["Onyx"]', sizes: '["7","8","9","10"]', tag: "ONE OF ONE", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800"]', description: "A statement signet ring featuring a polished black onyx stone set in heavy 18k gold plating.", material: "Surgical Steel + 18k Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Emerald Vine Choker", slug: "syra-necklace-02", kind: "Necklace", caption: "Nature, refined.", price: 32000, metals: '["18k Gold"]', stones: '["Emerald"]', sizes: '[]', tag: "NEW", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"]', description: "Interlocking gold vines set with brilliant-cut emeralds. A centerpiece for any formal evening.", material: "Surgical Steel + 18k Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Infinite Link Bracelet", slug: "syra-bracelet-02", kind: "Bracelet", caption: "Fluidity in gold.", price: 11000, metals: '["18k Gold","Sterling"]', stones: '["None"]', sizes: '[]', tag: null, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800"]', description: "Intertwined gold links that move gracefully with the wrist. Fully anti-tarnish and waterproof.", material: "Surgical Steel + 18k Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Golden Petal Hoop", slug: "syra-nose-02", kind: "Nose Ring", caption: "Delicate. Daring.", price: 3800, metals: '["18k Gold","Rose Gold"]', stones: '["None"]', sizes: '[]', tag: null, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"]', description: "A ultra-fine gold hoop with a textured petal finish. Designed for comfortable, all-day wear.", material: "Surgical Steel + Rose Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
    { name: "Solitaire Float", slug: "syra-necklace-03", kind: "Necklace", caption: "Weightless radiance.", price: 14500, metals: '["White Gold","18k Gold"]', stones: '["Diamond"]', sizes: '[]', tag: "BESTSELLER", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800", gallery: '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"]', description: "A single, brilliant-cut diamond that appears to float on the neck. Suspended from an invisible-link chain.", material: "Surgical Steel + White Gold PVD", warranty: "2 Year Anti-Tarnish Guarantee" },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, published: true, featured: true },
    })
  }
  console.log(`✓ ${products.length} products seeded`)

  // Seed home page content
  const sections = [
    { page: "home", section: "hero_1", title: "SYRA", subtitle: "Timeless Anti-Tarnish Elegance", body: "Waterproof. Sweat-proof. Worn for life.", image: "/hero/syra_hero_1.png", link: "/collection", linkText: "Shop Now" },
    { page: "home", section: "hero_2", title: "New Arrivals", subtitle: "The Celestial Collection", body: "Hand-set diamonds in anti-tarnish gold.", image: "/hero/syra_hero_2.png", link: "/collection?tag=NEW", linkText: "Explore" },
    { page: "home", section: "why_anti_tarnish", title: "Why Anti-Tarnish?", subtitle: "Built to last. Designed for life.", body: "Our PVD coating technology means your jewellery stays brilliant for years — not months. Waterproof, sweat-proof, and hypoallergenic.", image: "/jewellery/gen-gold-bracelet.png", image2: "/jewellery/gen-gold-bar.png", link: "/care-guide", linkText: "Learn More" },
    { page: "home", section: "trust_badges", title: "The SYRA Promise", metadata: '{"badges":["Anti-Tarnish Guarantee","Waterproof","Hypoallergenic","2-Year Warranty"]}' },
    { page: "home", section: "instagram", title: "Worn by You", subtitle: "@syrajewellery", body: "Tag us to be featured." },
    { page: "home", section: "newsletter", title: "Stay in the Loop", subtitle: "New drops, exclusive offers, and styling tips.", linkText: "Subscribe" },
  ]

  for (const s of sections) {
    await prisma.siteContent.upsert({
      where: { page_section: { page: s.page, section: s.section } },
      update: {},
      create: { ...s, published: true, sortOrder: sections.indexOf(s) },
    })
  }
  console.log(`✓ ${sections.length} content sections seeded`)

  // Seed settings
  const settings = [
    { key: "brand_name", value: "SYRA" },
    { key: "tagline", value: "Timeless Anti-Tarnish Elegance" },
    { key: "whatsapp_number", value: "919876543210" },
    { key: "whatsapp_message", value: "Hi! I have a question about SYRA jewellery." },
    { key: "free_shipping_threshold", value: "99900" },
    { key: "shipping_standard_rate", value: "0" },
    { key: "shipping_express_rate", value: "9900" },
    { key: "contact_email", value: "hello@syra.com" },
    { key: "contact_phone", value: "+91 98765 43210" },
    { key: "instagram_url", value: "https://instagram.com/syrajewellery" },
    { key: "announcement_bar_text", value: "Free shipping on orders over ₹999 ✨" },
    { key: "announcement_bar_link", value: "/collection" },
    { key: "announcement_bar_enabled", value: "true" },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }
  console.log(`✓ ${settings.length} settings seeded`)

  console.log("\n🎉 Database seeded successfully!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
