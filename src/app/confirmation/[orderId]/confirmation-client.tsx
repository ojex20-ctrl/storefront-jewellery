"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Reveal, WordReveal, Magnetic, LiveDot } from "@podium/ui/motion"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { useOrderStore } from "@/stores/order-store"

type DbStatus = {
  orderNumber: number
  status: string
  paymentStatus: string
  total: number
}

const FULFILMENT_STEPS = ["Confirmed", "Packing", "Shipped", "Delivered"] as const
// Map DB order status -> highlighted step index in the timeline.
const STEP_INDEX: Record<string, number> = {
  placed: 0,
  confirmed: 0,
  packed: 1,
  shipped: 2,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: 0,
}

export function ConfirmationClient({ orderId }: { orderId: string }) {
  const localOrder = useOrderStore((s) => s.byId(orderId))
  const [db, setDb] = useState<DbStatus | null>(null)
  const [polling, setPolling] = useState(true)

  // Poll the real order status for ~14s (payment webhook/verify may land slightly after redirect).
  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    let attempts = 0
    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/status?id=${encodeURIComponent(orderId)}`, { cache: "no-store" })
        const data = await res.json()
        if (cancelled) return
        if (res.ok && data.order) setDb(data.order)
        attempts += 1
        const settled = ["paid", "failed", "refunded"].includes((data.order?.paymentStatus ?? "").toLowerCase())
        if (settled || attempts >= 7) { setPolling(false); return }
      } catch {
        attempts += 1
        if (attempts >= 7) { setPolling(false); return }
      }
      setTimeout(() => void tick(), 2000)
    }
    void tick()
    return () => { cancelled = true }
  }, [orderId])

  if (!localOrder && !db) {
    return (
      <div className="px-4 py-32 text-center md:px-8">
        <p className="font-display text-4xl">No order found.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Return home</Button>
        </Link>
      </div>
    )
  }

  const firstName = localOrder?.details.firstName || "friend"
  const email = localOrder?.details.email || "your email"
  const itemCount = localOrder ? localOrder.items.reduce((s, i) => s + i.qty, 0) : 0
  const total = db?.total ?? localOrder?.total ?? 0
  const stepIndex = STEP_INDEX[(db?.status ?? "placed").toLowerCase()] ?? 0

  return (
    <div className="mx-auto max-w-[960px] px-4 py-24 md:px-8">
      <Eyebrow className="mb-3 block text-accent">
        <span className="inline-flex items-center gap-2">
          <LiveDot /> Order confirmed
        </span>
      </Eyebrow>
      <WordReveal
        text={`Thank you, _${firstName}_.`}
        className="mb-8 font-display"
        style={{ fontSize: "clamp(64px, 10vw, 140px)", lineHeight: 0.95, letterSpacing: "-0.025em" }}
      />
      <p className="mb-12 max-w-[560px] text-base leading-relaxed text-ink-2">
        Your order is in the studio. We&apos;ll send a confirmation to{" "}
        <strong>{email}</strong> and a WhatsApp dispatch update when it ships.
      </p>

      <Reveal stagger>
        <div className="mb-6 grid grid-cols-2 border border-line md:grid-cols-4">
          {[
            { l: "Order", v: db ? `#${db.orderNumber}` : orderId.slice(0, 10) },
            { l: "Items", v: `${itemCount} ${itemCount === 1 ? "piece" : "pieces"}` },
            { l: "Total", v: priceFmt(total) },
            { l: "Payment", v: "Razorpay" },
          ].map((c, i) => (
            <div key={i} className={`p-6 ${i < 3 ? "md:border-r md:border-line" : ""} ${i < 2 ? "border-r border-line" : ""}`}>
              <Eyebrow className="mb-2 block">{c.l}</Eyebrow>
              <p className="font-display text-2xl">{c.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Live status badges from the order DB */}
      <div className="mb-12 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
        <PaymentBadge value={db?.paymentStatus} polling={polling} />
        <FulfilmentBadge value={db?.status} />
        <span className="text-muted">{polling ? "confirming payment…" : "live status"}</span>
      </div>

      <div className="mb-14">
        <Eyebrow className="mb-6 block">What happens next</Eyebrow>
        <div className="relative grid grid-cols-2 md:grid-cols-4">
          {FULFILMENT_STEPS.map((step, i) => (
            <div key={step} className="relative py-5">
              <span
                className={`relative z-10 mb-3.5 block h-3.5 w-3.5 rounded-full border ${
                  i <= stepIndex ? "border-accent bg-accent" : "border-ink bg-transparent"
                }`}
              />
              <span className="absolute left-3.5 right-0 top-[26px] h-px bg-line" />
              <p className="font-display text-[22px]">{step}</p>
              <Eyebrow className="mt-1 block">
                {i === 0 ? "Now" : i === 1 ? "Tomorrow" : i === 2 ? "Day 2" : "Day 3–5"}
              </Eyebrow>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Magnetic>
          <Link href="/collection"><Button>Continue browsing →</Button></Link>
        </Magnetic>
        <Link href="/order-track"><Button variant="ghost">Track order</Button></Link>
      </div>
    </div>
  )
}

function PaymentBadge({ value, polling }: { value: string | undefined; polling: boolean }) {
  const v = (value ?? "pending").toLowerCase()
  const paid = v === "paid"
  const failed = v === "failed" || v === "refunded"
  const cls = paid
    ? "bg-accent text-bg"
    : failed
      ? "bg-red-500/20 text-red-300"
      : polling
        ? "bg-bg-2 text-muted animate-pulse"
        : "bg-bg-2 text-ink-2"
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${cls}`}>
      <span className="text-muted">Payment</span>
      <span>{paid ? "paid" : failed ? v : "pending"}</span>
    </span>
  )
}

function FulfilmentBadge({ value }: { value: string | undefined }) {
  const v = (value ?? "placed").toLowerCase().replace(/_/g, " ")
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-bg-2 px-3 py-1 text-ink-2">
      <span className="text-muted">Fulfilment</span>
      <span>{v}</span>
    </span>
  )
}
