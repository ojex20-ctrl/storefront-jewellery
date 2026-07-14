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
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store"
import { refreshCustomer } from "@/lib/auth"
import { fetchOrders, type StoreOrder } from "@/lib/orders"
import { ACCOUNT_NAV_LINKS } from "@/lib/navigation"

type Loyalty = {
  rewards: { points: number; tier: string }
  storeCredits: number
  referralCode: string
}

export function AccountClient() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const customer = useAuthStore((s) => s.customer)
  const setSession = useAuthStore((s) => s.setSession)
  const clear = useAuthStore((s) => s.clear)
  const recentlyViewed = useRecentlyViewedStore((s) => s.items)
  const [hydrated, setHydrated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [orders, setOrders] = useState<StoreOrder[] | null>(null)
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null)

  useEffect(() => setHydrated(true), [])

  useEffect(() => {
    if (!hydrated) return
    void (async () => {
      const fresh = await refreshCustomer(token || "customer_cookie")
      if (fresh) {
        setSession("customer_cookie", fresh)
        setCheckingSession(false)
        return
      }
      // Cookie is missing/expired — drop any stale persisted token so the UI
      // doesn't linger in a broken "logged in but every request 401s" state.
      clear()
      setCheckingSession(false)
      router.replace("/account/login?next=/account")
    })()
  }, [hydrated, token, router, setSession, clear])

  useEffect(() => {
    if (!token) return
    void (async () => {
      const fresh = await refreshCustomer(token)
      if (fresh) setSession("customer_cookie", fresh)
    })()
    void fetchOrders(token, { limit: 5 }).then((r) => setOrders(r.orders))
    void fetch("/api/account/loyalty", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then(setLoyalty)
      .catch(() => {})
  }, [token, setSession])

  if (!hydrated || checkingSession) {
    return (
      <div className="px-4 py-32 text-center md:px-8">
        <Eyebrow>Loading...</Eyebrow>
      </div>
    )
  }

  const displayName = customer?.first_name || customer?.email?.split("@")[0] || "friend"
  const handleSignOut = () => {
    void fetch("/api/auth/me", { method: "DELETE", credentials: "include" }).catch(() => null)
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
          {ACCOUNT_NAV_LINKS.map((m) => (
            <Link key={m.key} href={m.href} className="group flex w-full items-center justify-between border-b border-line py-3.5 text-left text-sm text-ink transition-colors hover:text-accent">
              <span>{m.label}</span>
              <span>{"->"}</span>
            </Link>
          ))}
          <Link href="/account/change-password" className="group flex w-full items-center justify-between border-b border-line py-3.5 text-left text-sm text-ink transition-colors hover:text-accent">
            <span>Change password</span>
            <span>{"->"}</span>
          </Link>
          {recentlyViewed.length > 0 && (
            <div className="border-b border-line py-3.5">
              <span className="text-sm text-ink">Recently viewed</span>
              <div className="mt-3 flex flex-col gap-2">
                {recentlyViewed.slice(0, 4).map((v) => (
                  <Link key={v.id} href={`/products/${v.id}`} className="flex items-center gap-3 text-sm text-muted hover:text-accent">
                    <span className="block h-10 w-8 shrink-0 overflow-hidden bg-bg-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {v.image ? <img src={v.image} alt="" className="h-full w-full object-cover" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{v.name}</span>
                    <span className="font-mono text-xs">{priceFmt(v.price)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <button onClick={handleSignOut} className="group flex w-full items-center justify-between border-b border-line py-3.5 text-left text-sm text-muted transition-colors hover:text-accent">
            <span>Sign out</span>
            <span>{"->"}</span>
          </button>
        </aside>

        <div>
          {loyalty && (
            <div className="mb-8 grid grid-cols-1 border border-line md:grid-cols-3">
              <Metric label="Rewards" value={`${loyalty.rewards.points} pts`} sub={loyalty.rewards.tier} />
              <Metric label="Store Credits" value={priceFmt(loyalty.storeCredits)} sub="Available" />
              <Metric label="Referral" value={loyalty.referralCode} sub="Share with friends" />
            </div>
          )}
          <div className="mb-3.5 flex items-end justify-between">
            <Eyebrow className="block">Recent orders</Eyebrow>
            <Link href="/account/orders" className="ulink font-mono text-[11px] uppercase tracking-widest text-accent">
              View all {"->"}
            </Link>
          </div>
          {orders === null ? (
            <Eyebrow className="text-muted">Loading orders...</Eyebrow>
          ) : orders.length === 0 ? (
            <div className="border border-line p-14 text-center">
              <p className="mb-2 font-display text-4xl"><em>No orders yet.</em></p>
              <Eyebrow className="mb-6 block">Place an order to see it here</Eyebrow>
              <Link href="/collection"><Button>Shop the collection</Button></Link>
            </div>
          ) : (
            orders.map((o) => (
              <motion.div key={o.id} whileHover={{ borderColor: "var(--accent)" }} transition={{ duration: 0.3 }} className="mb-3 border border-line p-6">
                <Link href={`/account/orders/${o.id}`} className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-2xl">#{o.display_id}</p>
                    <Eyebrow className="mt-1 block">
                      {o.items.length} items / {(o.fulfillment_status ?? "pending").replace(/_/g, " ")}
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

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border-b border-line p-5 md:border-b-0 md:border-r">
      <Eyebrow className="mb-2 block">{label}</Eyebrow>
      <p className="font-display text-2xl">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">{sub}</p>
    </div>
  )
}
