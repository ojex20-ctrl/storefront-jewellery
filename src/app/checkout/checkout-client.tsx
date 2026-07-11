"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Magnetic, LoaderBar } from "@podium/ui/motion"
import { Button, Eyebrow, Placeholder } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { useOrderStore } from "@/stores/order-store"
import type { BrandConfig } from "@/lib/brand-config"
import { openRazorpayCheckout } from "@/lib/razorpay"

/** Rental cart lines store a flacon hex; buy lines store a stone hex. Not shown as a colour name. */
const variantLabel = (_hex: string) => "Finish"

type Shipping = "standard" | "express" | "pickup"

// All money is in paise (₹1 = 100). Matches product prices and the /api/checkout server calc.
const FREE_SHIPPING_OVER = 99900 // ₹999
const STANDARD_RATE = 4900 // ₹49
const EXPRESS_RATE = 9900 // ₹99

const blank = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postcode: "",
  country: "India",
  phone: "",
}

type AppliedCoupon = { code: string; discount: number; message: string }

export function CheckoutClient({ brand: _brand }: { brand: BrandConfig }) {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const addOrder = useOrderStore((s) => s.add)
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [details, setDetails] = useState(blank)
  const [shipping, setShipping] = useState<Shipping>("standard")
  const [placing, setPlacing] = useState(false)

  const [couponInput, setCouponInput] = useState("")
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null)
  const [couponBusy, setCouponBusy] = useState(false)

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const ship =
    shipping === "pickup" ? 0 : shipping === "express" ? EXPRESS_RATE : subtotal >= FREE_SHIPPING_OVER ? 0 : STANDARD_RATE
  const discount = Math.min(coupon?.discount ?? 0, subtotal)
  const total = Math.max(0, subtotal + ship - discount)

  if (items.length === 0) return <EmptyState />

  const stepValid =
    step === 1
      ? details.email && details.firstName && details.address && details.city && details.postcode && details.phone
      : true

  const applyCoupon = async () => {
    const code = couponInput.trim()
    if (!code) return
    setCouponBusy(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) throw new Error(data.error || "Invalid coupon")
      setCoupon({ code: data.code, discount: data.discount, message: data.message })
      toast.success(data.message)
    } catch (err) {
      setCoupon(null)
      toast.error(err instanceof Error ? err.message : "Invalid coupon")
    } finally {
      setCouponBusy(false)
    }
  }

  const handlePlace = async () => {
    setPlacing(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: details.email,
          phone: details.phone,
          firstName: details.firstName,
          lastName: details.lastName,
          address: details.address,
          city: details.city,
          state: "",
          pincode: details.postcode,
          country: details.country,
          items: items.map((i) => ({ name: i.name, productId: i.productId, size: i.size, qty: i.qty, price: i.price, image: i.image })),
          subtotal,
          shippingCost: ship,
          discount,
          total,
          payment: "razorpay",
          couponCode: coupon?.code ?? null,
          giftWrap: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Order failed")
      const orderId = data.order.id

      await openRazorpayCheckout({
        internalOrderId: orderId,
        orderNumber: data.order.orderNumber,
        customer: details,
      })

      addOrder({ id: orderId, details, items, total, shipping, payment: "razorpay", createdAt: Date.now() })
      clearCart()
      router.push(`/confirmation/${orderId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed")
      setPlacing(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-70px)] grid-cols-1 md:grid-cols-[1.4fr_1fr]">
      <AnimatePresence>
        {placing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-bg"
          >
            <p className="font-display text-[56px] tracking-tighter">
              <em>Processing…</em>
            </p>
            <div className="w-60">
              <LoaderBar />
            </div>
            <Eyebrow>Securely confirming with Razorpay</Eyebrow>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-line p-6 md:border-r md:p-16">
        <Eyebrow className="mb-2 block">Checkout</Eyebrow>
        <p className="mb-8 font-display tracking-tighter" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
          <em>Almost</em> there.
        </p>

        <div className="mb-10 flex border-b border-line">
          {(["Details", "Shipping", "Payment"] as const).map((label, i) => {
            const n = i + 1
            const active = step === n
            const done = step > n
            return (
              <button
                key={label}
                onClick={() => done && setStep(n)}
                className={`flex-1 py-3.5 text-left transition-all ${
                  active ? "-mb-px border-b-2 border-accent" : ""
                } ${done ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`font-mono text-[11px] uppercase tracking-widest ${
                    active ? "text-accent" : done ? "text-ink" : "text-muted"
                  }`}
                >
                  {String(n).padStart(2, "0")} {done ? "✓" : ""} {label}
                </span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <Field label="Email" value={details.email} onChange={(v) => setDetails({ ...details, email: v })} placeholder="email@domain.com" />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="First name" value={details.firstName} onChange={(v) => setDetails({ ...details, firstName: v })} />
                  <Field label="Last name" value={details.lastName} onChange={(v) => setDetails({ ...details, lastName: v })} />
                </div>
                <Field label="Address" value={details.address} onChange={(v) => setDetails({ ...details, address: v })} />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr_1fr]">
                  <Field label="City" value={details.city} onChange={(v) => setDetails({ ...details, city: v })} />
                  <Field label="Pincode" value={details.postcode} onChange={(v) => setDetails({ ...details, postcode: v })} />
                  <Field label="Country" value={details.country} onChange={(v) => setDetails({ ...details, country: v })} />
                </div>
                <Field label="Phone (Mobile)" value={details.phone} onChange={(v) => setDetails({ ...details, phone: v })} placeholder="+91 ..." />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                {(
                  [
                    { id: "standard", label: "Standard", desc: "3–5 days · Tracked", price: subtotal >= FREE_SHIPPING_OVER ? 0 : STANDARD_RATE },
                    { id: "express", label: "Express", desc: "1–2 days · Priority", price: EXPRESS_RATE },
                    { id: "pickup", label: "Store pickup", desc: "Collect in-store", price: 0 },
                  ] as const
                ).map((opt) => {
                  const active = shipping === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setShipping(opt.id)}
                      className={`flex items-center justify-between border p-6 text-left transition-all ${
                        active ? "border-accent bg-accent-soft" : "border-line bg-transparent"
                      }`}
                    >
                      <div>
                        <p className="font-display text-2xl">{opt.label}</p>
                        <Eyebrow className="mt-1 block">{opt.desc}</Eyebrow>
                      </div>
                      <span className="font-mono text-sm">{opt.price === 0 ? "FREE" : priceFmt(opt.price)}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border border-accent bg-accent-soft p-6">
                  <div>
                    <p className="font-display text-2xl">Razorpay</p>
                    <Eyebrow className="mt-1 block">Cards · UPI · Netbanking · Wallets</Eyebrow>
                  </div>
                  <span className="border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
                    Secure
                  </span>
                </div>
                <p className="text-[13px] text-muted">
                  You&apos;ll complete payment securely via Razorpay. Your card details never touch our servers.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between border-t border-line pt-6">
          {step > 1 ? (
            <button onClick={() => setStep((s) => s - 1)} className="ulink font-mono text-[11px] uppercase tracking-widest">
              ← Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Magnetic strength={0.15}>
              <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid}>
                Continue →
              </Button>
            </Magnetic>
          ) : (
            <Magnetic strength={0.15}>
              <Button onClick={handlePlace}>Place order — {priceFmt(total)}</Button>
            </Magnetic>
          )}
        </div>
      </div>

      <aside
        className="self-start bg-bg-2 p-6 md:sticky md:top-[70px] md:max-h-[calc(100vh-70px)] md:overflow-y-auto md:p-12"
        style={{
          backgroundImage: [
            "radial-gradient(500px 400px at 100% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 60%)",
            "radial-gradient(500px 400px at 0% 100%, color-mix(in srgb, var(--accent-2, var(--accent)) 14%, transparent), transparent 60%)",
          ].join(","),
          backgroundRepeat: "no-repeat",
        }}
      >
        <Eyebrow className="mb-4 block">Order summary</Eyebrow>
        <div className="mb-6 flex flex-col gap-4 border-b border-line pb-6">
          {items.map((item, idx) => (
            <div key={item.lineId} className="grid grid-cols-[60px_1fr_auto] items-center gap-3">
              <Placeholder
                image={item.image}
                tint={(((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5)}
                label={item.productId.toUpperCase()}
                className="aspect-[4/5]"
              />
              <div>
                <p className="font-display text-base">{item.name}</p>
                <Eyebrow className="mt-0.5 block">
                  {variantLabel(item.color)} · {item.size} · ×{item.qty}
                </Eyebrow>
              </div>
              <span className="font-mono text-xs">{priceFmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mb-6 border-b border-line pb-6">
          {coupon ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widest text-accent">✓ {coupon.code}</span>
                <p className="mt-0.5 text-[12px] text-muted">{coupon.message}</p>
              </div>
              <button
                onClick={() => { setCoupon(null); setCouponInput("") }}
                className="font-mono text-[10px] uppercase tracking-widest text-muted underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                placeholder="PROMO CODE"
                className="w-full border border-line bg-transparent px-3 py-2.5 font-mono text-[12px] uppercase tracking-widest text-ink outline-none focus:border-ink"
              />
              <button
                onClick={applyCoupon}
                disabled={couponBusy || !couponInput.trim()}
                className="shrink-0 border border-ink px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-ink transition-colors hover:bg-ink hover:text-bg disabled:opacity-40"
              >
                {couponBusy ? "…" : "Apply"}
              </button>
            </div>
          )}
        </div>

        <Row label="Subtotal" value={priceFmt(subtotal)} />
        <Row label="Shipping" value={ship === 0 ? "FREE" : priceFmt(ship)} />
        {discount > 0 && <Row label={`Discount (${coupon?.code})`} value={`− ${priceFmt(discount)}`} accent />}
        <Row label="Tax" value="Included" muted />
        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="font-display text-2xl">Total</span>
          <motion.span key={total} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-mono text-xl">
            {priceFmt(total)}
          </motion.span>
        </div>
      </aside>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label className="block">
      <span
        className={`mb-1.5 block font-mono text-[10px] uppercase tracking-widest transition-colors ${
          focus ? "text-accent" : "text-muted"
        }`}
      >
        {label}
      </span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className={`w-full border-0 border-b bg-transparent py-2.5 text-sm text-ink outline-none transition-colors ${
          focus ? "border-ink" : "border-line-2"
        }`}
      />
    </label>
  )
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${accent ? "text-accent" : muted ? "text-muted" : "text-ink"}`}>{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="px-4 py-32 text-center md:px-8">
      <Eyebrow className="mb-3.5 block">Checkout</Eyebrow>
      <p className="mb-4 font-display text-6xl tracking-tighter">
        Your bag is <em>empty</em>.
      </p>
      <Link href="/collection">
        <Button>Explore the collection →</Button>
      </Link>
    </div>
  )
}
