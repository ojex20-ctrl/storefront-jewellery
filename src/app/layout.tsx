import type { Metadata } from "next"
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google"
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
import { cookies, headers } from "next/headers"
import { getBrandConfig } from "@/lib/brand-config"
import { CURRENCY_COOKIE, resolveCurrency, setActiveCurrencyForRender } from "@podium/ui/lib"

const display = Instrument_Serif({ subsets: ["latin"], weight: ["400"], variable: "--font-display-pkg" })
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body-pkg" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-pkg" })

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrandConfig()
  return {
    title: { default: `${brand.brand_name} — Rentals and Jewels`, template: `%s · ${brand.brand_name}` },
    description: brand.hero_copy ?? "SYRA — Premium anti-tarnish jewellery and editorial pieces.",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"),
    openGraph: {
      title: brand.brand_name,
      description: (brand.tagline ?? "Rentals and Jewels,|worn for the moment.").replace("|", " "),
      type: "website",
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrandConfig()
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
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <BrandStyles brand={brand} />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <ThemeBootstrap />
        <BrandProvider brand={brand}>
          <LenisProvider>
            <ScrollProgress />
            <SiteChrome brand={brand} currency={currency}>{children}</SiteChrome>
            <CartDrawer />
          </LenisProvider>
        </BrandProvider>
        <WhatsAppButton />
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
