"use client"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Nav, Footer } from "@podium/ui/chrome"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { AccountMenu } from "./account-menu"
import { SearchTrigger } from "./search-trigger"
import { ThemeToggle } from "./theme-toggle"
import type { BrandConfig } from "@/lib/brand-config"
import { buildStorefrontNavLinks, MENU_SEARCH_HREF, STOREFRONT_FOOTER_GROUPS } from "@/lib/navigation"

/**
 * Perfumes chrome — every piece of copy / link / flag comes from `brand`.
 */
export function SiteChrome({
  brand,
  currency,
  adminPreview = false,
  children,
}: {
  brand: BrandConfig
  currency: string
  adminPreview?: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const cartBumping = useCartStore((s) => s.bumping)
  const setCartOpen = useCartStore((s) => s.setOpen)

  const tagline = brand.tagline ?? "Rentals and Jewels,|worn for the moment."
  const flags = brand.feature_flags ?? {}
  const enableSearch = flags.enable_search !== false
  const navLinks = buildStorefrontNavLinks(brand.nav_links, { includeSearch: enableSearch })
  const footerGroups = brand.footer_groups ?? STOREFRONT_FOOTER_GROUPS
  const computedFooterGroups = brand.social_links?.instagram
    ? [
        ...footerGroups,
        { title: "Social", links: [{ href: brand.social_links.instagram, label: "Instagram" }] },
      ]
    : footerGroups
  const marqueeItems = brand.marquee_items ?? [
    `Free shipping over ${priceFmt(brand.free_shipping_threshold)}`,
    tagline.replace("|", " "),
  ]
  const newsletterCopy =
    brand.newsletter_copy ??
    "Quiet dispatches when new pieces enter the collection."
  const copyright =
    brand.footer_copyright ?? `© ${new Date().getFullYear()} ${brand.brand_name}`

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
        activeHref={navLinks.find((l) => {
          const baseHref = l.href.split("?")[0] || l.href
          return l.href === "/" ? pathname === "/" : pathname.startsWith(baseHref)
        })?.href}
        cartCount={cartCount}
        cartBumping={cartBumping}
        onCartClick={() => setCartOpen(true)}
      />
      {enableSearch && <SearchTrigger renderButton={false} listenForHref={MENU_SEARCH_HREF} />}
      <AccountMenu />
      <div className="fixed bottom-5 left-5 z-[120] flex items-center gap-1 border border-line bg-bg/92 p-1 text-ink shadow-xl backdrop-blur md:left-6">
        <ThemeToggle />
      </div>

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
        groups={computedFooterGroups}
        newsletterCopy={newsletterCopy}
        copyright={copyright}
      />
      {adminPreview && !pathname.startsWith("/admin") && (
        <a
          href="/admin"
          className="fixed bottom-20 left-5 z-50 border border-white/10 bg-[#0B0B0C] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white shadow-2xl transition-colors hover:bg-accent hover:text-bg md:left-6"
        >
          Back to Admin
        </a>
      )}
    </>
  )
}
