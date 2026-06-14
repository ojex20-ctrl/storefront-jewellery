"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { LiveDot } from "@podium/ui/motion"
import { priceFmt } from "@podium/ui/lib"
import { useAuthStore } from "@/stores/auth-store"
import { refreshCustomer } from "@/lib/auth"
import { fetchOrders, type StoreOrder } from "@/lib/orders"

const MENU = [
  { key: "orders", label: "Orders", href: "/account/orders" },
  { key: "profile", label: "Profile", href: "/account/profile" },
  { key: "addresses", label: "Addresses", href: "/account/addresses" },
  { key: "wishlist", label: "Wishlist", href: "/account/wishlist" },
] as const

/**
 * Account dashboard. Authentication-gated — unauthenticated users are
 * redirected to /login with `?next=/account` so they bounce back here
 * after signing in. Pulls the live order list from Medusa
 * (`/store/customers/me/orders`) so the recent-orders strip is real.
 */
export function AccountClient() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const customer = useAuthStore((s) => s.customer)
  const setCustomer = useAuthStore((s) => s.setCustomer)
  const clear = useAuthStore((s) => s.clear)

  const [hydrated, setHydrated] = useState(false)
  const [orders, setOrders] = useState<StoreOrder[] | null>(null)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!token) router.replace("/login?next=/account")
  }, [hydrated, token, router])

  useEffect(() => {
    if (!token) return
    // [MOCK] Backend disabled — skip Medusa customer refresh and orders fetch.
    // void (async () => {
    //   const fresh = await refreshCustomer(token)
    //   if (fresh) setCustomer(fresh)
    // })()
    // void fetchOrders(token, { limit: 5 }).then((r) => setOrders(r.orders))
    setOrders([]) // show empty state
  }, [token, setCustomer])

  if (!hydrated || !token) {
    return (
      <div className="px-4 py-32 text-center md:px-8">
        <Eyebrow>Loading…</Eyebrow>
      </div>
    )
  }

  const displayName = customer?.first_name || customer?.email?.split("@")[0] || "friend"

  const handleSignOut = () => {
    clear()
    toast.success("Signed out")
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 md:px-8 md:py-20">
      <Eyebrow className="mb-3 block">Account</Eyebrow>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className="mb-12 font-display tracking-tighter"
        style={{ fontSize: "clamp(56px, 7vw, 96px)" }}
      >
        Hello, <em className="text-accent">{displayName}</em>.
      </motion.p>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
        <aside>
          <Eyebrow className="mb-3.5 block">Menu</Eyebrow>
          {MENU.map((m) => (
            <Link
              key={m.key}
              href={m.href}
              className="group flex w-full items-center justify-between border-b border-line py-3.5 text-left text-sm text-ink transition-colors hover:text-accent"
            >
              <span>{m.label}</span>
              <span>→</span>
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="group flex w-full items-center justify-between border-b border-line py-3.5 text-left text-sm text-muted transition-colors hover:text-accent"
          >
            <span>Sign out</span>
            <span>→</span>
          </button>
        </aside>

        <div>
          <div className="mb-3.5 flex items-end justify-between">
            <Eyebrow className="block">Recent orders</Eyebrow>
            <Link href="/account/orders" className="ulink font-mono text-[11px] uppercase tracking-widest text-accent">
              View all →
            </Link>
          </div>
          {orders === null ? (
            <Eyebrow className="text-muted">Loading orders…</Eyebrow>
          ) : orders.length === 0 ? (
            <div className="border border-line p-14 text-center">
              <p className="mb-2 font-display text-4xl">
                <em>No orders yet.</em>
              </p>
              <Eyebrow className="mb-6 block">Place an order to see it here</Eyebrow>
              <Link href="/collection">
                <Button>Shop the collection</Button>
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <motion.div
                key={o.id}
                whileHover={{ borderColor: "var(--accent)" }}
                transition={{ duration: 0.3 }}
                className="mb-3 border border-line p-6"
              >
                <Link href={`/account/orders/${o.id}`} className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-2xl">#{o.display_id}</p>
                    <Eyebrow className="mt-1 block">
                      {o.items.length} items · {(o.fulfillment_status ?? "pending").replace(/_/g, " ")}
                    </Eyebrow>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{priceFmt(o.total)}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 bg-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-ink">
                      <LiveDot className="bg-ink" />
                      Track
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
