/**
 * Brand-config loader (jewellery). Mirror of clothing's loader — same shape,
 * different fallback values.
 */

export type NavLink = { href: string; label: string }
export type FooterGroup = { title: string; links: NavLink[] }
export type AnnouncementBar = { enabled: boolean; message: string; href: string | null }
export type SocialLinks = Partial<{
  instagram: string | null
  twitter: string | null
  tiktok: string | null
  facebook: string | null
  pinterest: string | null
  youtube: string | null
}>
export type FeatureFlags = Partial<{
  enable_3d_viewer: boolean
  enable_wishlist: boolean
  enable_search: boolean
  enable_route_transitions: boolean
  enable_announcement_bar: boolean
}>

export type BrandConfig = {
  id: string
  handle: string
  brand_name: string
  tagline: string | null
  logo_url: string | null
  accent_hex: string
  bg_hex: string
  ink_hex: string
  hero_copy: string | null
  hero_product_handle: string | null
  enabled_payment_providers: string[] | null
  free_shipping_threshold: number
  gender_entry: boolean
  nav_links: NavLink[] | null
  footer_groups: FooterGroup[] | null
  marquee_items: string[] | null
  announcement_bar: AnnouncementBar | null
  social_links: SocialLinks | null
  newsletter_copy: string | null
  footer_copyright: string | null
  default_region: string
  default_currency: string
  feature_flags: FeatureFlags | null

  // Phase 3 — shop / contact + chrome microcopy
  shop_address: string | null
  shop_phone: string | null
  shop_email: string | null
  shop_hours: string | null
  shop_map_url: string | null
  shop_whatsapp: string | null
  chrome_strings: Record<string, string> | null
}

const HANDLE = process.env.NEXT_PUBLIC_BRAND_HANDLE ?? "jewellery"
const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

const FALLBACK: BrandConfig = {
  id: "fallback",
  handle: HANDLE,
  brand_name: process.env.NEXT_PUBLIC_BRAND ?? "SYRA",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Timeless Anti-Tarnish Elegance.",
  logo_url: null,
  accent_hex: "#c9a36b",
  bg_hex: "#1f1812",
  ink_hex: "#faf3e2",
  hero_copy: null,
  hero_product_handle: null,
  enabled_payment_providers: null,
  free_shipping_threshold: 500,
  gender_entry: false,
  nav_links: null,
  footer_groups: null,
  marquee_items: null,
  announcement_bar: null,
  social_links: null,
  newsletter_copy: null,
  footer_copyright: null,
  default_region: "in",
  default_currency: "INR",
  feature_flags: null,
  shop_address: null,
  shop_phone: null,
  shop_email: null,
  shop_hours: null,
  shop_map_url: null,
  shop_whatsapp: null,
  chrome_strings: null,
}

export async function getBrandConfig(): Promise<BrandConfig> {
  // [MOCK] Backend disabled for UI-only development — always return fallback config.
  try {
    const { prisma } = await import("./db")
    const rows = await prisma.setting.findMany()
    const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]))
    return {
      ...FALLBACK,
      brand_name: settings.brand_name || FALLBACK.brand_name,
      tagline: settings.tagline || FALLBACK.tagline,
      free_shipping_threshold: Number(settings.free_shipping_threshold || FALLBACK.free_shipping_threshold),
      nav_links: parseJson(settings.nav_links, FALLBACK.nav_links),
      announcement_bar: {
        enabled: settings.announcement_bar_enabled === "true",
        message: settings.announcement_bar_text || "",
        href: settings.announcement_bar_link || null,
      },
      social_links: {
        instagram: settings.instagram_url || process.env.PUBLIC_INSTAGRAM_URL || null,
      },
      shop_email: settings.contact_email || null,
      shop_phone: settings.contact_phone || null,
      shop_whatsapp: settings.whatsapp_number || null,
      feature_flags: {
        enable_search: true,
        enable_route_transitions: true,
        enable_announcement_bar: settings.announcement_bar_enabled === "true",
      },
    }
  } catch {
    return FALLBACK
  }
  // try {
  //   const headers: Record<string, string> = {}
  //   const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  //   if (key) headers["x-publishable-api-key"] = key
  //   const resp = await fetch(`${BACKEND}/store/brand-config/${HANDLE}`, {
  //     headers,
  //     next: { revalidate: 30, tags: [`brand:${HANDLE}`] },
  //   })
  //   if (!resp.ok) return FALLBACK
  //   const data = (await resp.json()) as { brand_config: BrandConfig }
  //   return { ...FALLBACK, ...data.brand_config }
  // } catch {
  //   return FALLBACK
  // }
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
