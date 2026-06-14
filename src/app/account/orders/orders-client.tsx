"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { LoaderBar } from "@podium/ui/motion"
import { priceFmt } from "@podium/ui/lib"
import { useAuthStore } from "@/stores/auth-store"
import { fetchOrders, type StoreOrder } from "@/lib/orders"

export function OrdersClient() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const [orders, setOrders] = useState<StoreOrder[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      router.replace("/login?next=/account/orders")
      return
    }
    void fetchOrders(token, { limit: 50 }).then((r) => {
      setOrders(r.orders)
      setLoading(false)
    })
  }, [token, router])

  return (
    <div className="mx-auto max-w-[960px] px-4 py-14 md:px-8 md:py-20">
      <Eyebrow className="mb-3 block">Account · Orders</Eyebrow>
      <h1
        className="mb-10 font-display tracking-tighter"
        style={{ fontSize: "clamp(48px, 6vw, 96px)" }}
      >
        Your <em className="text-accent">orders</em>.
      </h1>

      <Link href="/account" className="ulink mb-8 inline-block font-mono text-[11px] uppercase tracking-widest text-muted">
        ← Back to account
      </Link>

      {loading ? (
        <div className="my-20 mx-auto w-48"><LoaderBar /></div>
      ) : (orders?.length ?? 0) === 0 ? (
        <div className="border border-line p-14 text-center">
          <p className="mb-2 font-display text-4xl">
            <em>No orders yet.</em>
          </p>
          <Eyebrow className="mb-6 block">Place your first order to see it here</Eyebrow>
          <Link href="/collection">
            <Button>Shop the collection</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders!.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderRow({ order }: { order: StoreOrder }) {
  const status = (order.fulfillment_status ?? "pending").replace(/_/g, " ")
  return (
    <motion.div
      whileHover={{ borderColor: "var(--accent)" }}
      transition={{ duration: 0.25 }}
      className="border border-line p-6"
    >
      <Link href={`/account/orders/${order.id}`} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
        <div>
          <Eyebrow className="block">Order #{order.display_id}</Eyebrow>
          <p className="mt-1 font-display text-2xl">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <Eyebrow className="block">Items</Eyebrow>
          <p className="mt-1 text-sm text-ink-2">
            {order.items.length} item{order.items.length === 1 ? "" : "s"}
          </p>
        </div>
        <div>
          <Eyebrow className="block">Status</Eyebrow>
          <span className="mt-1 inline-flex items-center gap-1.5 bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink">
            {status}
          </span>
        </div>
        <div className="text-right md:text-right">
          <p className="font-mono text-sm">{priceFmt(order.total)}</p>
          <p className="font-mono text-[10px] uppercase text-muted">view tracking →</p>
        </div>
      </Link>
    </motion.div>
  )
}
