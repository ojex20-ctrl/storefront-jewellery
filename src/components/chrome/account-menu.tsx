"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Heart, HelpCircle, Home, LogIn, LogOut, MapPin, PackageSearch, RotateCcw, ShieldCheck, UserRound } from "lucide-react"
import { ACCOUNT_NAV_LINKS } from "@/lib/navigation"
import { refreshCustomer } from "@/lib/auth"
import { useAuthStore } from "@/stores/auth-store"

const ICONS = {
  orders: PackageSearch,
  profile: UserRound,
  addresses: MapPin,
  wishlist: Heart,
  track: PackageSearch,
  security: ShieldCheck,
  support: HelpCircle,
  returns: RotateCcw,
} as const

export function AccountMenu() {
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const customer = useAuthStore((state) => state.customer)
  const token = useAuthStore((state) => state.token)
  const setSession = useAuthStore((state) => state.setSession)
  const clear = useAuthStore((state) => state.clear)

  const displayName = customer?.first_name || customer?.email?.split("@")[0] || "Customer"
  const accountLinks = useMemo(() => {
    const canChangePassword = customer?.can_change_password !== false
    return ACCOUNT_NAV_LINKS.filter((item) => canChangePassword || item.key !== "security")
  }, [customer?.can_change_password])
  const initials = useMemo(() => {
    const name = `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim() || customer?.email || "SY"
    return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  }, [customer])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      const accountLink = target.closest<HTMLAnchorElement>('a[href="/account"]')
      if (!accountLink) {
        setOpen(false)
        return
      }
      if (target.closest("main, footer")) return
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      setOpen((value) => !value)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    setChecking(true)
    void refreshCustomer(token || "customer_cookie")
      .then((fresh) => {
        if (fresh) setSession("customer_cookie", fresh)
      })
      .finally(() => setChecking(false))
  }, [open, token, setSession])

  const logout = async () => {
    await fetch("/api/auth/me", { method: "DELETE", credentials: "include" }).catch(() => null)
    clear()
    setOpen(false)
    router.push("/")
    router.refresh()
  }

  const close = () => setOpen(false)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="account-menu-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[139] bg-black/20 md:bg-transparent"
          />
          <motion.div
            key="account-menu"
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed right-4 top-16 z-[160] w-[min(360px,calc(100vw-2rem))] border border-line bg-paper text-ink shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:right-6 md:top-20"
          >
            {customer ? (
              <>
                <div className="flex items-center gap-3 border-b border-line p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs uppercase tracking-widest text-bg">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xl">{displayName}</p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted">{checking ? "Checking session" : customer.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 p-2">
                  <MenuLink href="/account" label="Account dashboard" description="Rewards, recent orders, and shortcuts" icon={Home} onClick={close} />
                  {accountLinks.map((item) => {
                    const Icon = ICONS[item.key as keyof typeof ICONS] ?? UserRound
                    return <MenuLink key={item.key} href={item.href} label={item.label} description={item.description} icon={Icon} onClick={close} />
                  })}
                </div>
                <div className="border-t border-line p-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-muted transition-colors hover:bg-bg-2 hover:text-accent"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.6} />
                    <span className="font-mono text-[11px] uppercase tracking-widest">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <p className="font-display text-2xl">Your account</p>
                <p className="mt-1 text-sm leading-6 text-muted">Sign in to see order history, saved addresses, wishlist, rewards, and faster checkout.</p>
                <div className="mt-5 grid gap-2">
                  <Link onClick={close} href="/account/login?next=/account" className="flex items-center justify-center gap-2 bg-ink px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-bg hover:bg-accent hover:text-bg">
                    <LogIn className="h-4 w-4" strokeWidth={1.6} /> Sign in
                  </Link>
                  <Link onClick={close} href="/account/register" className="border border-line px-4 py-3 text-center font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent">
                    Create account
                  </Link>
                  <Link onClick={close} href="/order-track" className="border border-line px-4 py-3 text-center font-mono text-[11px] uppercase tracking-widest text-muted hover:border-accent hover:text-accent">
                    Track an order
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function MenuLink({ href, label, description, icon: Icon, onClick }: { href: string; label: string; description: string; icon: typeof UserRound; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-bg-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-muted transition-colors group-hover:border-accent group-hover:text-accent">
        <Icon className="h-4 w-4" strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] uppercase tracking-widest text-ink">{label}</span>
        <span className="mt-0.5 block truncate text-[12px] text-muted">{description}</span>
      </span>
    </Link>
  )
}
