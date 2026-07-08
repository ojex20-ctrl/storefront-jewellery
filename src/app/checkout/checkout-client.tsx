"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Magnetic, LoaderBar } from "@podium/ui/motion"
import { Button, Eyebrow, Placeholder } from "@podium/ui/primitives"
import {
  priceFmt,
  // createMedusaCheckout,  // [MOCK] disabled
  // MedusaCheckoutError,    // [MOCK] disabled
} from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { useOrderStore } from "@/stores/order-store"
import { useAuthStore } from "@/stores/auth-store"
// import { openRazorpayPopup } from "@/lib/razorpay-popup"  // [MOCK] disabled
// import { openStripePopup } from "@/lib/stripe-popup"      // [MOCK] disabled
// import { resolveZioraCartLines } from "@/lib/cart-to-medusa"  // [MOCK] disabled
import { resolvePaymentChoices, type PaymentChoice } from "@/lib/payment-providers"
import type { BrandConfig } from "@/lib/brand-config"
import { openRazorpayCheckout } from "@/lib/razorpay"

/** Perfume cart lines store flacon hex; we don't run them through a colour name lookup. */
const colorName = (_hex: string) => "Flacon"

type Shipping = "standard" | "express" | "pickup"
type Payment = "razorpay" | "stripe"

const blank = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postcode: "",
  country: "United Arab Emirates",
  phone: "",
}

export function CheckoutClient({ brand }: { brand: BrandConfig }) {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const addOrder = useOrderStore((s) => s.add)
  const customerToken = useAuthStore((s) => s.token)
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [details, setDetails] = useState(blank)
  const [shipping, setShipping] = useState<Shipping>("standard")
  const [payment, setPayment] = useState<Payment>("razorpay")
  const [placing, setPlacing] = useState(false)

  const [choices, setChoices] = useState<PaymentChoice[] | null>(null)
  useEffect(() => {
    void (async () => {
      const list = await resolvePaymentChoices(null, brand)
      setChoices(list)
      if (list.length > 0) {
        setPayment(list[0]!.id.includes("razorpay") ? "razorpay" : "stripe")
      }
    })()
  }, [brand])

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const deposit = items.reduce(
    (s, i) => s + (i.rental?.security_deposit ?? 0) * i.qty,
    0,
  )
  const ship = shipping === "express" ? 50 : shipping === "pickup" ? 0 : subtotal > 500 ? 0 : 30
  const total = subtotal + ship + deposit

  if (items.length === 0) return <EmptyState />

  const stepValid =
    step === 1
      ? details.email && details.firstName && details.address && details.city && details.postcode && details.phone
      : true

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
          discount: 0,
          total,
          payment,
          giftWrap: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Order failed")
      const orderId = data.order.id

      if (payment === "razorpay") {
        await openRazorpayCheckout({
          internalOrderId: orderId,
          orderNumber: data.order.orderNumber,
          customer: details,
        })
      }

      addOrder({ id: orderId, details, items, total, shipping, payment, createdAt: Date.now() })
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
            <Eyebrow>Securely confirming with {payment === "razorpay" ? "Razorpay" : "Stripe"}</Eyebrow>
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
                  <Field label="Postcode" value={details.postcode} onChange={(v) => setDetails({ ...details, postcode: v })} />
                  <Field label="Country" value={details.country} onChange={(v) => setDetails({ ...details, country: v })} />
                </div>
                <Field label="Phone (Mobile)" value={details.phone} onChange={(v) => setDetails({ ...details, phone: v })} placeholder="+971 ..." />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                {(
                  [
                    { id: "standard", label: "Standard", desc: "2–4 days · Tracked", price: subtotal > 500 ? 0 : 30 },
                    { id: "express", label: "Express", desc: "24 hours · Same emirate", price: 50 },
                    { id: "pickup", label: "Studio pickup", desc: "Dubai · Al Quoz", price: 0 },
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
                      <span className="font-mono text-sm">
                        {opt.price === 0 ? "FREE" : priceFmt(opt.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                {choices === null && (
                  <div className="border border-line p-6">
                    <Eyebrow>Loading payment options…</Eyebrow>
                  </div>
                )}
                {choices !== null && choices.length === 0 && (
                  <div className="border border-line p-6">
                    <Eyebrow className="text-accent">No payment gateways enabled</Eyebrow>
                    <p className="mt-2 text-sm text-muted">
                      Enable a gateway in the admin (Settings → Regions → Payment, or
                      Brand settings → Enabled payment gateways).
                    </p>
                  </div>
                )}
                {choices?.map((opt) => {
                  const shortId = opt.id.includes("razorpay") ? "razorpay" : "stripe"
                  const active = payment === shortId
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setPayment(shortId)}
                      className={`flex items-center justify-between border p-6 text-left transition-all ${
                        active ? "border-accent bg-accent-soft" : "border-line bg-transparent"
                      }`}
                    >
                      <div>
                        <p className="font-display text-2xl">{opt.label}</p>
                        <Eyebrow className="mt-1 block">{opt.description}</Eyebrow>
                      </div>
                      <span className="border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
                        {opt.badge}
                      </span>
                    </button>
                  )
                })}
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
                  {colorName(item.color)} · {item.size} · ×{item.qty}
                </Eyebrow>
                {item.rental && (
                  <span className="mt-1 inline-block bg-accent/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
                    ★ rent · {item.rental.days}d · returns {prettyDate(item.rental.end_date)}
                  </span>
                )}
              </div>
              <span className="font-mono text-xs">{priceFmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <Row label="Subtotal" value={priceFmt(subtotal)} />
        <Row label="Shipping" value={ship === 0 ? "FREE" : priceFmt(ship)} />
        {deposit > 0 && (
          <Row label="Refundable deposit" value={priceFmt(deposit)} />
        )}
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

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between py-1 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${muted ? "text-muted" : "text-ink"}`}>{value}</span>
    </div>
  )
}

function prettyDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, { day: "2-digit", month: "short" })
}

function EmptyState() {
  return (
    <div className="px-4 py-32 text-center md:px-8">
      <Eyebrow className="mb-3.5 block">Checkout</Eyebrow>
      <p className="mb-4 font-display text-6xl tracking-tighter">
        Your bag is <em>empty</em>.
      </p>
      <Link href="/tops">
        <Button>Browse Tops →</Button>
      </Link>
    </div>
  )
}
