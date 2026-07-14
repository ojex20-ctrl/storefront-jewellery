import type { Metadata } from "next"
import { Toaster } from "sonner"
import "./globals.css"

import { LenisProvider } from "@/providers/lenis-provider"
import { ScrollProgress } from "@podium/ui/motion"
import { SiteChrome } from "@/components/chrome/site-chrome"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ThemeBootstrap } from "@/providers/theme-bootstrap"
import { BrandStyles } from "@/components/chrome/brand-styles"
import { BrandProvider } from "@/providers/brand-provider"
import { WhatsAppButton } from "@/components/chrome/whatsapp-button"
import { MarketingWidgets } from "@/components/marketing/marketing-widgets"
import { WishlistSync } from "@/components/commerce/wishlist-sync"
import { CompareTray } from "@/components/commerce/compare-tray"
import { cookies, headers } from "next/headers"
import { getBrandConfig } from "@/lib/brand-config"
import { CURRENCY_COOKIE, resolveCurrency, setActiveCurrencyForRender } from "@podium/ui/lib"
import { verifyAdminSession } from "@/lib/admin-auth"
import { JsonLd } from "@/components/seo/json-ld"
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo-jsonld"
import { fetchProducts } from "@/lib/medusa-products"
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  INDEXABLE_ROBOTS,
  SEO_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  absoluteImage,
  trimDescription,
} from "@/lib/seo"

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandConfig()
  const title = brand.seo_title || `${brand.brand_name} - Anti-Tarnish Jewellery`
  const description = trimDescription(brand.seo_description || brand.hero_copy || DEFAULT_SEO_DESCRIPTION)
  const image = absoluteImage(brand.logo_url || DEFAULT_OG_IMAGE)

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: { default: title || DEFAULT_SEO_TITLE, template: `%s · ${brand.brand_name}` },
    description,
    keywords: SEO_KEYWORDS,
    authors: [{ name: brand.brand_name, url: SITE_URL }],
    creator: brand.brand_name,
    publisher: brand.brand_name,
    category: "jewellery",
    alternates: { canonical: "/" },
    robots: INDEXABLE_ROBOTS,
    openGraph: {
      title,
      description,
      url: "/",
      siteName: brand.brand_name,
      locale: "en_IN",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: brand.brand_name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    formatDetection: { telephone: false, address: false, email: false },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [brand, compareProducts] = await Promise.all([getBrandConfig(), fetchProducts()])
  const adminSession = await verifyAdminSession()
  const cookieJar = await cookies()
  const headerJar = await headers()
  const country =
    headerJar.get("cf-ipcountry") ??
    headerJar.get("x-vercel-ip-country") ??
    headerJar.get("x-country")
  const currency = resolveCurrency(
    cookieJar.get(CURRENCY_COOKIE)?.value,
    country,
    brand.default_currency,
  )
  // Tell the shared priceFmt the active currency for this SSR pass so
  // its symbol matches the value Medusa returned for this request.
  setActiveCurrencyForRender(currency)
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <BrandStyles brand={brand} />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <ThemeBootstrap />
        <BrandProvider brand={brand}>
          <LenisProvider>
            <ScrollProgress />
            <SiteChrome brand={brand} currency={currency} adminPreview={Boolean(adminSession)}>{children}</SiteChrome>
            <CartDrawer />
            <CompareTray products={compareProducts} />
          </LenisProvider>
        </BrandProvider>
        <MarketingWidgets />
        <WishlistSync />
        <WhatsAppButton
          phone={brand.shop_whatsapp ?? process.env.PUBLIC_WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
          message={brand.shop_whatsapp_message ?? process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ?? "Hi, I need help with my order"}
        />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--ink)",
              color: "var(--bg)",
              border: "1px solid var(--ink-2)",
              borderRadius: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            },
          }}
        />
      </body>
    </html>
  )
}
