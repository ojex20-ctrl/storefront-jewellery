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
  shipping_standard_rate: number
  shipping_express_rate: number
  seo_title: string | null
  seo_description: string | null
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
  free_shipping_threshold: 99900, // ₹999 in paise
  shipping_standard_rate: 4900, // ₹49
  shipping_express_rate: 9900, // ₹99
  seo_title: null,
  seo_description: null,
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
    const num = (v: string | undefined, fb: number) => {
      const n = Number(v)
      return v !== undefined && v !== "" && Number.isFinite(n) ? n : fb
    }
    return {
      ...FALLBACK,
      brand_name: settings.brand_name || FALLBACK.brand_name,
      tagline: settings.tagline || FALLBACK.tagline,
      logo_url: settings.logo_url || FALLBACK.logo_url,
      free_shipping_threshold: num(settings.free_shipping_threshold, FALLBACK.free_shipping_threshold),
      shipping_standard_rate: num(settings.shipping_standard_rate, FALLBACK.shipping_standard_rate),
      shipping_express_rate: num(settings.shipping_express_rate, FALLBACK.shipping_express_rate),
      seo_title: settings.seo_title || FALLBACK.seo_title,
      seo_description: settings.seo_description || FALLBACK.seo_description,
      newsletter_copy: settings.newsletter_copy || FALLBACK.newsletter_copy,
      footer_copyright: settings.footer_copyright || FALLBACK.footer_copyright,
      nav_links: parseJson(settings.nav_links, FALLBACK.nav_links),
      announcement_bar: {
        enabled: settings.announcement_bar_enabled === "true",
        message: settings.announcement_bar_text || "",
        href: settings.announcement_bar_link || null,
      },
      social_links: {
        instagram: settings.instagram_url || process.env.PUBLIC_INSTAGRAM_URL || null,
        facebook: settings.facebook_url || null,
        twitter: settings.twitter_url || null,
        youtube: settings.youtube_url || null,
        pinterest: settings.pinterest_url || null,
      },
      shop_email: settings.contact_email || null,
      shop_phone: settings.contact_phone || null,
      shop_address: settings.shop_address || null,
      shop_hours: settings.shop_hours || null,
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
