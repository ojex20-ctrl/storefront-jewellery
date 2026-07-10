"use client"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"

const STEPS = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"]

type TrackedOrder = {
  orderNumber: number
  status: string
  paymentStatus: string
  total: number
  createdAt: string
  items: string
}

export function OrderTrackClient() {
  const [orderNumber, setOrderNumber] = useState("")
  const [identity, setIdentity] = useState("")
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
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
    <div className="mx-auto max-w-[900px] px-4 py-20 md:px-8 md:py-28">
      <Eyebrow className="mb-3 block">Track order</Eyebrow>
      <h1 className="mb-10 font-display text-5xl tracking-tight md:text-7xl">Order status</h1>

      <form onSubmit={onSubmit} className="grid gap-5 border border-line p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <Field label="Order number" value={orderNumber} onChange={setOrderNumber} placeholder="1001" />
        <Field label="Email or phone" value={identity} onChange={setIdentity} placeholder="you@example.com" />
        <Button type="submit" disabled={loading}>{loading ? "Checking..." : "Track"}</Button>
      </form>

      {order && (
        <div className="mt-10 border border-line p-6">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow className="mb-2 block">Order #{order.orderNumber}</Eyebrow>
              <p className="font-display text-3xl">{statusLabel(order.status)}</p>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted">
              {priceFmt(order.total)} / payment {order.paymentStatus}
            </div>
          </div>

          {order.status === "cancelled" ? (
            <div className="border border-red-500/30 p-4 text-sm text-red-500">This order has been cancelled.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-6">
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

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}
