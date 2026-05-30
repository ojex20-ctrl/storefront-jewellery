"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Reveal, WordReveal, Magnetic, LiveDot } from "@podium/ui/motion"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { useOrderStore } from "@/stores/order-store"
import { useAuthStore } from "@/stores/auth-store"
import { fetchOrder, type StoreOrder } from "@/lib/orders"

export function ConfirmationClient({ orderId }: { orderId: string }) {
  const localOrder = useOrderStore((s) => s.byId(orderId))
  const token = useAuthStore((s) => s.token)
  const [medusaOrder, setMedusaOrder] = useState<StoreOrder | null>(null)
  const [polling, setPolling] = useState(false)

  // [MOCK] Backend disabled — skip Medusa order polling.
  // Real polling code commented out below.
  // useEffect(() => {
  //   if (!token || !orderId) return
  //   let cancelled = false
  //   setPolling(true)
  //   let attempts = 0
  //   const tick = async () => {
  //     const o = await fetchOrder(token, orderId)
  //     if (cancelled) return
  //     if (o) setMedusaOrder(o)
  //     attempts += 1
  //     const captured = (o?.payment_status ?? "").toLowerCase() === "captured"
  //     if (captured || attempts >= 6) { setPolling(false); return }
  //     setTimeout(() => void tick(), 2000)
  //   }
  //   void tick()
  //   return () => { cancelled = true }
  // }, [token, orderId])

  // Fall back to the local stub when (a) the customer is anonymous, or
  // (b) Medusa hasn't replicated the order yet. Either source has all the
  // copy we need to render — the difference is statuses.
  if (!localOrder && !medusaOrder) {
    return (
      <div className="px-4 py-32 text-center md:px-8">
        <p className="font-display text-4xl">No order found.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Return home</Button>
        </Link>
      </div>
    )
  }
  const order = localOrder ?? buildFromMedusa(medusaOrder!)

  const rentals = order.items.filter((i) => i.rental)
  const deposit = rentals.reduce(
    (s, i) => s + (i.rental?.security_deposit ?? 0) * i.qty,
    0,
  )

  return (
    <div className="mx-auto max-w-[960px] px-4 py-24 md:px-8">
      <Eyebrow className="mb-3 block text-accent">
        <span className="inline-flex items-center gap-2">
          <LiveDot /> Order confirmed
        </span>
      </Eyebrow>
      <WordReveal
        text={`Thank you, _${order.details.firstName || "friend"}_.`}
        className="mb-8 font-display"
        style={{ fontSize: "clamp(64px, 10vw, 140px)", lineHeight: 0.95, letterSpacing: "-0.025em" }}
      />
      <p className="mb-12 max-w-[560px] text-base leading-relaxed text-ink-2">
        Your order is in the studio. We&apos;ll send a confirmation to{" "}
        <strong>{order.details.email || "your email"}</strong> and a WhatsApp dispatch update when it ships.
      </p>

      <Reveal stagger>
        <div className="mb-6 grid grid-cols-2 border border-line md:grid-cols-4">
          {[
            {
              l: "Order ID",
              v: medusaOrder ? `#${medusaOrder.display_id}` : order.id.slice(0, 12),
            },
            { l: "Items", v: `${order.items.reduce((s, i) => s + i.qty, 0)} pieces` },
            { l: "Total", v: priceFmt(medusaOrder?.total ?? order.total) },
            {
              l: "Payment",
              v: order.payment === "razorpay" ? "Razorpay" : "Stripe",
            },
          ].map((c, i) => (
            <div key={i} className={`p-6 ${i < 3 ? "md:border-r md:border-line" : ""} ${i < 2 ? "border-r border-line" : ""}`}>
              <Eyebrow className="mb-2 block">{c.l}</Eyebrow>
              <p className="font-display text-2xl">{c.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Live status badges from Medusa (poll for ~12s post-checkout) */}
      <div className="mb-12 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
        <StatusBadge label="Payment" value={medusaOrder?.payment_status} polling={polling} />
        <StatusBadge
          label="Fulfilment"
          value={medusaOrder?.fulfillment_status ?? "pending"}
          polling={polling}
        />
        <span className="text-muted">
          {polling ? "checking with the gateway…" : "live status"}
        </span>
      </div>

      {rentals.length > 0 && (
        <div className="mb-14 border border-accent/40 bg-accent/5 p-6 md:p-8">
          <Eyebrow className="mb-3 block text-accent">★ Rental pieces in this order</Eyebrow>
          <p className="mb-5 max-w-[480px] text-sm text-ink-2">
            Refundable deposit of <strong>{priceFmt(deposit)}</strong> is held against these pieces.
            We refund within 5 working days of return inspection.
          </p>
          <ul className="divide-y divide-line">
            {rentals.map((r) => (
              <li
                key={r.lineId}
                className="grid grid-cols-1 gap-2 py-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="font-display text-xl">{r.name}</p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {r.size} · {r.qty}× · {r.rental?.days}d
                  </span>
                </div>
                <div>
                  <Eyebrow className="block">Pickup</Eyebrow>
                  <p className="font-mono text-sm">{prettyDate(r.rental!.start_date)}</p>
                </div>
                <div>
                  <Eyebrow className="block">Return by</Eyebrow>
                  <p className="font-mono text-sm text-accent">{prettyDate(r.rental!.end_date)}</p>
                </div>
                <p className="text-right font-mono text-sm">
                  {priceFmt(r.rental!.security_deposit * r.qty)}{" "}
                  <span className="text-muted">deposit</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-14">
        <Eyebrow className="mb-6 block">What happens next</Eyebrow>
        <div className="relative grid grid-cols-2 md:grid-cols-4">
          {["Confirmed", "Packing", "Shipped", "Delivered"].map((step, i) => (
            <div key={step} className="relative py-5">
              <span
                className={`relative z-10 mb-3.5 block h-3.5 w-3.5 rounded-full border ${
                  i === 0 ? "border-accent bg-accent" : "border-ink bg-transparent"
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
          <Link href="/"><Button>Continue browsing →</Button></Link>
        </Magnetic>
        <Link href="/account"><Button variant="ghost">View order</Button></Link>
      </div>
    </div>
  )
}

function prettyDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

/** Build a local-shaped order from a Medusa order — used as a render
 *  fallback when no local stub is available (anonymous checkout). */
function buildFromMedusa(o: StoreOrder) {
  return {
    id: o.id,
    details: {
      email: o.email ?? "",
      firstName: o.shipping_address?.first_name ?? "",
      lastName: o.shipping_address?.last_name ?? "",
      address: o.shipping_address?.address_1 ?? "",
      city: o.shipping_address?.city ?? "",
      postcode: o.shipping_address?.postal_code ?? "",
      country: o.shipping_address?.country_code ?? "ae",
      phone: o.shipping_address?.phone ?? "",
    },
    items: (o.items ?? []).map((i) => ({
      lineId: i.id,
      productId: i.id,
      name: i.title,
      category: i.variant_title ?? "",
      price: i.unit_price,
      size: "",
      color: "",
      qty: i.quantity,
      rental: undefined,
    })),
    total: o.total,
    shipping: "standard" as const,
    payment: "razorpay" as const,
    createdAt: new Date(o.created_at).getTime(),
  }
}

function StatusBadge({
  label,
  value,
  polling,
}: {
  label: string
  value: string | undefined
  polling: boolean
}) {
  const v = (value ?? "—").toLowerCase()
  const captured = v === "captured"
  const failed = v === "canceled" || v === "failed" || v === "refunded"
  const cls = captured
    ? "bg-accent text-bg"
    : failed
      ? "bg-red-500/20 text-red-300"
      : polling
        ? "bg-bg-2 text-muted animate-pulse"
        : "bg-bg-2 text-ink-2"
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${cls}`}>
      <span className="text-muted">{label}</span>
      <span>{(value ?? "pending").replace(/_/g, " ")}</span>
    </span>
  )
}
