"use client"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { isValidEmail, isValidPhone } from "@/lib/validation"

const STEPS = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"]

type TrackedOrderItem = {
  id: string
  name: string
  category: string
  image: string
  size: string
  price: number
  qty: number
}

type TrackedOrder = {
  orderNumber: number
  status: string
  paymentStatus: string
  paymentMethod: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  createdAt: string
  trackingNumber?: string | null
  trackingUrl?: string | null
  items: TrackedOrderItem[]
}

export function OrderTrackClient() {
  const [orderNumber, setOrderNumber] = useState("")
  const [identity, setIdentity] = useState("")
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsedOrderNumber = Number(orderNumber.replace(/[^\d]/g, ""))
    const validIdentity = isValidEmail(identity) || isValidPhone(identity, { required: true })
    if (!Number.isInteger(parsedOrderNumber) || parsedOrderNumber <= 0 || !validIdentity) {
      toast.error("Enter a valid order number and the email or phone used at checkout.")
      return
    }
    setLoading(true)
    setOrder(null)
    try {
      const resp = await fetch("/api/order-track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber, identity }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || "Order not found")
      setOrder(data.order)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order not found")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8 md:py-24">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
        Home
      </Link>

      <div className="mb-10 max-w-3xl">
        <Eyebrow className="mb-3 block">Track order</Eyebrow>
        <h1 className="font-display text-4xl tracking-tight md:text-6xl">Order history and status</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Use the details from checkout to view status, items, totals, and shipment links.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5 border border-line bg-paper p-5 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-6">
        <Field label="Order number" value={orderNumber} onChange={setOrderNumber} placeholder="1001" />
        <Field label="Email or phone" value={identity} onChange={setIdentity} placeholder="you@example.com" />
        <Button type="submit" disabled={loading}>{loading ? "Checking..." : "Track"}</Button>
      </form>

      {order && (
        <div className="mt-10 space-y-6">
          <div className="border border-line bg-paper p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow className="mb-2 block">Order #{order.orderNumber}</Eyebrow>
                <p className="font-display text-3xl md:text-4xl">{statusLabel(order.status)}</p>
                <p className="mt-2 text-sm text-muted">Placed {formatDate(order.createdAt)}</p>
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted">
                {priceFmt(order.total)} / payment {statusLabel(order.paymentStatus)}
              </div>
            </div>

            {order.trackingNumber || order.trackingUrl ? (
              <div className="mt-6 flex flex-col gap-3 border border-line bg-bg p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Shipping tracking</p>
                  <p className="mt-1 text-sm text-ink">{order.trackingNumber || "Tracking link available"}</p>
                </div>
                {order.trackingUrl ? (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent">
                    Open tracking
                    <ExternalLink className="h-3 w-3" strokeWidth={1.6} />
                  </a>
                ) : null}
              </div>
            ) : null}

            {order.status === "cancelled" ? (
              <div className="mt-6 border border-red-500/30 p-4 text-sm text-red-500">This order has been cancelled.</div>
            ) : (
              <div className="mt-8 grid gap-3 md:grid-cols-6">
                {STEPS.map((step, index) => {
                  const currentIndex = Math.max(0, STEPS.indexOf(order.status))
                  const done = index <= currentIndex
                  const active = index === currentIndex
                  return (
                    <div key={step} className={`border p-4 ${done ? "border-accent bg-accent-soft" : "border-line"}`}>
                      <div className={`mb-3 h-2 w-2 rounded-full ${active ? "bg-accent" : done ? "bg-ink" : "bg-muted"}`} />
                      <p className="text-xs uppercase tracking-widest">{statusLabel(step)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="border border-line bg-paper p-5">
              <Eyebrow className="mb-4 block">Items</Eyebrow>
              <div className="divide-y divide-line">
                {order.items.length > 0 ? order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-line bg-bg-2">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-tight">{item.name}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                        {[item.category, item.size].filter(Boolean).join(" / ") || "SYRA piece"}
                      </p>
                      <p className="mt-2 text-sm text-muted">Qty {item.qty}</p>
                    </div>
                    <div className="text-right text-sm font-medium">{priceFmt(item.price * item.qty)}</div>
                  </div>
                )) : (
                  <p className="py-8 text-sm text-muted">No item details are attached to this order.</p>
                )}
              </div>
            </div>

            <div className="border border-line bg-paper p-5">
              <Eyebrow className="mb-4 block">Summary</Eyebrow>
              <SummaryRow label="Subtotal" value={priceFmt(order.subtotal)} />
              <SummaryRow label="Shipping" value={priceFmt(order.shippingCost)} />
              {order.discount > 0 && <SummaryRow label="Discount" value={`-${priceFmt(order.discount)}`} />}
              <div className="my-4 border-t border-line" />
              <SummaryRow label="Total" value={priceFmt(order.total)} strong />
              <div className="mt-5 border-t border-line pt-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Payment</p>
                <p className="mt-1 text-sm">{statusLabel(order.paymentStatus)}{order.paymentMethod ? ` via ${statusLabel(order.paymentMethod)}` : ""}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full border-0 border-b border-line bg-transparent py-2.5 text-sm outline-none focus:border-accent"
      />
    </label>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${strong ? "font-semibold" : "text-sm text-muted"}`}>
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date))
}
