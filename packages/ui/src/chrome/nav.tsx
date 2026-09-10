"use client"
import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Menu, X } from "lucide-react"
import { cn } from "../lib/cn"
import { useLiveClock } from "../hooks/use-live-clock"
import { LiveDot } from "../motion/live-dot"
import { GenderToggle } from "../primitives/gender-toggle"
import { CurrencyPicker } from "./currency-picker"

type NavLinkConfig = { href: string; label: string; children?: NavLinkConfig[] }
type Gender = "men" | "women"

type NavProps = {
  brand: string
  logoUrl?: string
  className?: string
  links: NavLinkConfig[]
  activeHref?: string
  cartCount: number
  cartBumping?: boolean
  onCartClick: () => void
  /** Optional gender toggle. Omit for storefronts that don't split by gender. */
  gender?: Gender
  onGenderChange?: (g: Gender) => void
  /** Additional content rendered before the gender toggle. */
  extra?: ReactNode
  /** Active currency code — when set, a CurrencyPicker dropdown is
   *  rendered next to Cart. Omit to hide the picker. */
  currency?: string
  /** Optional secondary list shown only inside the mobile drawer
   * (account/wishlist/help/legal). Each item has the same shape as `links`. */
  drawerSecondary?: NavLinkConfig[]
}

/**
 * Sticky storefront header. Desktop renders an inline link bar; mobile
 * collapses into a hamburger that opens a slide-over drawer with the full
 * link list, account access, and any provided `drawerSecondary` items
 * (typically wishlist + help + legal).
 *
 * Sticky behaviour: `position: sticky; top: 0` with a backdrop blur. We
 * also bump the shadow once the page has scrolled past ~12px so the
 * header doesn't fade into white pages, but we hold off the heavier
 * styling on the first paint to avoid a layout flash.
 */
export function Nav({
  brand,
  logoUrl,
  className,
  links,
  activeHref,
  cartCount,
  cartBumping,
  onCartClick,
  gender,
  onGenderChange,
  extra,
  currency,
  drawerSecondary,
}: NavProps) {
  const clock = useLiveClock("Asia/Dubai")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  // Close the drawer on route change. Activehref switches each navigation,
  // so we can use it as a proxy for "the user just clicked a link".
  useEffect(() => {
    setDrawerOpen(false)
  }, [activeHref])

  return (
    <>
      <header
        className={cn(
          className,
          "sticky top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center border-b bg-bg/85 px-4 py-4 backdrop-blur-md transition-shadow md:grid-cols-[1fr_auto_1fr] md:px-8 md:py-4",
          scrolled
            ? "border-line shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
            : "border-transparent",
        )}
      >
        {/* Desktop links */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => l.children?.length ? (
            <div key={l.href} className="group/nav relative">
              <Link
                href={l.href}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink transition-colors hover:text-accent"
              >
                {l.label}
                <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover/nav:rotate-180" strokeWidth={1.6} />
              </Link>
              <div className="pointer-events-none absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-2 pt-5 opacity-0 transition-all duration-300 group-hover/nav:pointer-events-auto group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-focus-within/nav:pointer-events-auto group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100">
                <div className="border border-line bg-bg/95 p-2 shadow-2xl backdrop-blur-xl">
                  {l.children.map((child) => (
                    <Link key={child.href} href={child.href} className="block border-b border-line px-3 py-3 font-mono text-[11px] normal-case tracking-normal text-ink-2 transition-colors last:border-0 hover:bg-bg-2 hover:text-accent">
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "group relative font-mono text-[11px] uppercase tracking-widest transition-colors",
                activeHref === l.href ? "text-ink" : "text-ink hover:text-accent",
              )}
            >
              {l.label}
              <span
                className={cn(
                  "absolute -bottom-1 left-1/2 right-1/2 h-px bg-accent transition-all duration-300 ease-out group-hover:left-0 group-hover:right-0",
                  activeHref === l.href && "left-0 right-0 bg-ink",
                )}
              />
            </Link>
          ))}
          <span className="ml-2 inline-flex items-center gap-1.5">
            <LiveDot />
            <span className="font-mono text-[10px] tracking-wider text-muted">
              DXB {clock}
            </span>
          </span>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Menu"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.6} />
        </button>

        <Link
          href="/"
          className="justify-self-center font-display text-2xl tracking-[0.04em] transition-transform duration-300 hover:scale-105"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brand} className="marble-nav-logo" />
          ) : brand}
        </Link>

        <div className="flex items-center justify-end gap-3 md:gap-5">
          <Link
            href="/account"
            aria-label="Account"
            className={cn(
              "hidden font-mono text-[11px] uppercase tracking-widest hover:text-accent md:inline",
              activeHref?.startsWith("/account") && "text-accent",
            )}
          >
            Account
          </Link>
          {currency && (
            <CurrencyPicker current={currency} className="hidden md:block" />
          )}
          <button
            onClick={onCartClick}
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest hover:text-accent"
          >
            Cart
            <span
              className={cn(
                "font-mono text-muted",
                cartBumping && "animate-bump inline-block",
              )}
            >
              [{String(cartCount).padStart(2, "0")}]
            </span>
          </button>
          {extra}
          {gender && onGenderChange && (
            <GenderToggle value={gender} onChange={onGenderChange} />
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="scrim"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="fixed inset-y-0 left-0 z-[111] flex w-[min(360px,85vw)] flex-col border-r border-line bg-bg shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="font-display text-2xl tracking-[0.04em]">{logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={brand} className="marble-nav-logo" />
                ) : brand}</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="text-muted hover:text-ink"
                >
                  <X className="h-5 w-5" strokeWidth={1.6} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <ul className="flex flex-col">
                  {links.map((l) => (
                    <li key={l.href}>
                      {l.children?.length ? (
                        <details className="group/menu border-b border-line">
                          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-display text-2xl transition-colors hover:text-accent">
                            {l.label}
                            <ChevronDown className="h-5 w-5 transition-transform duration-300 group-open/menu:rotate-180" strokeWidth={1.4} />
                          </summary>
                          <div className="border-t border-line bg-bg-2/70 px-5 py-2">
                            {l.children.map((child) => (
                              <Link key={child.href} href={child.href} onClick={() => setDrawerOpen(false)} className="block border-b border-line py-3 font-mono text-xs text-ink-2 last:border-0 hover:text-accent">
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <Link
                          href={l.href}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            "block border-b border-line px-5 py-4 font-display text-2xl transition-colors hover:text-accent",
                            activeHref === l.href && "text-accent",
                          )}
                        >
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="border-b border-line px-5 py-5">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                    Account
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    <DrawerSecondaryLink
                      href="/account"
                      label="Dashboard"
                      onClick={() => setDrawerOpen(false)}
                    />
                    <DrawerSecondaryLink
                      href="/account/orders"
                      label="My orders"
                      onClick={() => setDrawerOpen(false)}
                    />
                    <DrawerSecondaryLink
                      href="/account/wishlist"
                      label="Wishlist"
                      onClick={() => setDrawerOpen(false)}
                    />
                    <DrawerSecondaryLink
                      href="/account/profile"
                      label="Profile"
                      onClick={() => setDrawerOpen(false)}
                    />
                    <DrawerSecondaryLink
                      href="/login"
                      label="Sign in"
                      onClick={() => setDrawerOpen(false)}
                    />
                  </ul>
                </div>

                {drawerSecondary && drawerSecondary.length > 0 && (
                  <div className="px-5 py-5">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                      More
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {drawerSecondary.map((l) => (
                        <DrawerSecondaryLink
                          key={l.href}
                          href={l.href}
                          label={l.label}
                          onClick={() => setDrawerOpen(false)}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="border-t border-line px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <LiveDot />
                  DXB {clock}
                </span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function DrawerSecondaryLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick: () => void
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="block py-1 font-mono text-xs uppercase tracking-widest text-ink-2 transition-colors hover:text-accent"
      >
        {label}
      </Link>
    </li>
  )
}
