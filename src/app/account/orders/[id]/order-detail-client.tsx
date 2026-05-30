"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eyebrow, Placeholder } from "@podium/ui/primitives"
import { LoaderBar, LiveDot } from "@podium/ui/motion"
import { priceFmt } from "@podium/ui/lib"
import { useAuthStore } from "@/stores/auth-store"
import { fetchOrder, buildTimeline, type StoreOrder } from "@/lib/orders"

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const [order, setOrder] = useState<StoreOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) {
      router.replace(`/login?next=/account/orders/${orderId}`)
      return
    }
    void fetchOrder(token, orderId).then((o) => {
      if (!o) setNotFound(true)
      else setOrder(o)
      setLoading(false)
    })
  }, [token, orderId, router])

  if (loading) {
    return (
      <div className="my-32 mx-auto w-48">
        <LoaderBar />
      </div>
    )
  }
  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-32 text-center md:px-8">
        <Eyebrow>Order not found</Eyebrow>
        <p className="mt-4 font-display text-5xl">
          <em>That order isn&apos;t in your account.</em>
        </p>
        <Link href="/account/orders" className="ulink mt-8 inline-block font-mono text-[11px] uppercase tracking-widest text-accent">
          ← Back to orders
        </Link>
      </div>
    )
  }

  const steps = buildTimeline(order)
  const a = order.shipping_address ?? null

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 md:px-8 md:py-20">
      <Link href="/account/orders" className="ulink mb-6 inline-block font-mono text-[11px] uppercase tracking-widest text-muted">
        ← All orders
      </Link>

      <div className="mb-12 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <Eyebrow className="block">Order</Eyebrow>
          <p className="font-display tracking-tighter" style={{ fontSize: "clamp(40px, 5vw, 76px)" }}>
            #{order.display_id}
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
            placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
          <LiveDot className="bg-ink" />
          {(order.fulfillment_status ?? "pending").replace(/_/g, " ")}
        </span>
      </div>

      {/* TIMELINE */}
      <section className="mb-12">
        <Eyebrow className="mb-5 block">Tracking</Eyebrow>
        <ol className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.li
              key={s.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className={`relative border p-4 transition-colors ${
                s.done ? "border-accent" : "border-line"
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{`0${i + 1}`}</span>
              <p
                className={`mt-2 font-display text-lg ${
                  s.active ? "text-accent" : s.done ? "text-ink" : "text-muted"
                }`}
              >
                {s.label}
              </p>
              {s.done && s.date && (
                <p className="mt-1 font-mono text-[10px] text-muted">
                  {new Date(s.date).toLocaleDateString()}
                </p>
              )}
              {s.active && (
                <span className="absolute right-3 top-3 inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
              )}
            </motion.li>
          ))}
        </ol>
      </section>

      <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
        {/* ITEMS */}
        <section>
          <Eyebrow className="mb-5 block">Items</Eyebrow>
          <div className="flex flex-col gap-3">
            {order.items.map((it) => (
              <div key={it.id} className="flex gap-4 border border-line p-4">
                <div className="h-20 w-16 shrink-0">
                  <Placeholder image={it.thumbnail ?? undefined} className="h-full w-full" tint={3} alt={it.title} />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="font-display text-xl">{it.title}</p>
                    {it.variant_title && (
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{it.variant_title}</p>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-[10px] uppercase text-muted">qty {it.quantity}</span>
                    <span className="font-mono text-sm">{priceFmt(it.subtotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SUMMARY + ADDRESS */}
        <aside className="flex flex-col gap-8">
          <div>
            <Eyebrow className="mb-3 block">Summary</Eyebrow>
            <div className="border border-line p-4 font-mono text-sm">
              <Row k="Subtotal" v={priceFmt(order.subtotal)} />
              <Row k="Shipping" v={priceFmt(order.shipping_total)} />
              <Row k="Tax" v={priceFmt(order.tax_total)} />
              <div className="mt-2 border-t border-line pt-2">
                <Row k="Total" v={priceFmt(order.total)} bold />
              </div>
            </div>
          </div>
          {a && (
            <div>
              <Eyebrow className="mb-3 block">Shipping to</Eyebrow>
              <div className="border border-line p-4 text-sm leading-relaxed">
                <p>
                  {a.first_name} {a.last_name}
                </p>
                <p>{a.address_1}</p>
                <p>
                  {a.city}
                  {a.postal_code ? `, ${a.postal_code}` : ""}
                </p>
                <p>{a.country_code?.toUpperCase()}</p>
                {a.phone && <p className="mt-1 font-mono text-[11px] text-muted">{a.phone}</p>}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-ink" : "text-ink-2"}`}>
      <span className="text-muted">{k}</span>
      <span>{v}</span>
    </div>
  )
}
