"use client"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Nav, Footer } from "@podium/ui/chrome"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { SearchTrigger } from "./search-trigger"
import type { BrandConfig } from "@/lib/brand-config"

/**
 * Perfumes chrome — every piece of copy / link / flag comes from `brand`.
 */
export function SiteChrome({
  brand,
  currency,
  children,
}: {
  brand: BrandConfig
  currency: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const cartBumping = useCartStore((s) => s.bumping)
  const setCartOpen = useCartStore((s) => s.setOpen)

  const tagline = brand.tagline ?? "Rentals and Jewels,|worn for the moment."
  const navLinks = brand.nav_links ?? [
    { href: "/collection", label: "Collection" },
    { href: "/warranty", label: "Warranty" },
    { href: "/about", label: "About" },
    { href: "/journal", label: "Journal" },
  ]
  const footerGroups = brand.footer_groups ?? [
    { title: "Shop", links: [
      { href: "/collection", label: "All Pieces" },
      { href: "/collection?kind=Ring", label: "Rings" },
      { href: "/collection?kind=Necklace", label: "Necklaces" },
      { href: "/collection?kind=Bracelet", label: "Bracelets" },
      { href: "/collection?kind=Earrings", label: "Earrings" },
    ] },
    { title: "Help", links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
      { href: "/size-guide", label: "Size Guide" },
      { href: "/warranty", label: "Warranty" },
      { href: "/care-guide", label: "Care Guide" },
    ] },
    { title: "Company", links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/journal", label: "Journal" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ] },
  ]
  const marqueeItems = brand.marquee_items ?? [
    `Free shipping over ${priceFmt(brand.free_shipping_threshold)}`,
    tagline.replace("|", " "),
  ]
  const newsletterCopy =
    brand.newsletter_copy ??
    "Quiet dispatches when new pieces enter the collection."
  const copyright =
    brand.footer_copyright ?? `© ${new Date().getFullYear()} ${brand.brand_name}`

  const flags = brand.feature_flags ?? {}
  const enableSearch = flags.enable_search !== false
  const enableTransitions = flags.enable_route_transitions !== false
  const showAnnouncement =
    (flags.enable_announcement_bar ?? false) &&
    brand.announcement_bar?.enabled === true

  return (
    <>
      {showAnnouncement && brand.announcement_bar?.message && (
        <div className="bg-ink py-2 text-center font-mono text-[11px] uppercase tracking-widest text-bg">
          {brand.announcement_bar.href ? (
            <a href={brand.announcement_bar.href} className="hover:underline">
              {brand.announcement_bar.message}
            </a>
          ) : (
            <span>{brand.announcement_bar.message}</span>
          )}
        </div>
      )}

      <Nav
        brand={brand.brand_name}
        links={navLinks}
        activeHref={navLinks.find((l) => pathname.startsWith(l.href))?.href}
        currency={currency}
        cartCount={cartCount}
        cartBumping={cartBumping}
        onCartClick={() => setCartOpen(true)}
        extra={enableSearch ? <SearchTrigger /> : undefined}
      />

      {enableTransitions ? (
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      ) : (
        <main>{children}</main>
      )}

      <Footer
        brand={brand.brand_name}
        tagline={tagline}
        marqueeItems={marqueeItems}
        groups={footerGroups}
        newsletterCopy={newsletterCopy}
        copyright={copyright}
      />
    </>
  )
}
