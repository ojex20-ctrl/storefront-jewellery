"use client"
import { useCallback, useEffect, useState, type InputHTMLAttributes } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Magnetic, LoaderBar } from "@podium/ui/motion"
import { Button, Eyebrow, Placeholder } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { useOrderStore } from "@/stores/order-store"
import { useAuthStore } from "@/stores/auth-store"
import type { BrandConfig } from "@/lib/brand-config"
import { openRazorpayCheckout } from "@/lib/razorpay"
import { addAddress, listAddresses, type Address } from "@/lib/account"
import { isValidEmail, isValidName, isValidPhone, isValidPlainText, isValidPostalCode } from "@/lib/validation"

/** Rental cart lines store a flacon hex; buy lines store a stone hex. Not shown as a colour name. */
const variantLabel = (_hex: string) => "Finish"

type Shipping = "standard" | "express" | "pickup"

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
type CheckoutDetails = typeof blank
type DetailKey = keyof CheckoutDetails

const ADDRESS_DETAIL_KEYS: DetailKey[] = ["firstName", "lastName", "address", "city", "postcode", "country", "phone"]

function normalizeCheckoutCountry(value?: string | null) {
  const country = value?.trim()
  if (!country) return "India"
  return country.toLowerCase() === "in" ? "India" : country
}

function addressToDetails(address: Address, current: CheckoutDetails): CheckoutDetails {
  return {
    ...current,
    firstName: address.first_name || current.firstName,
    lastName: address.last_name || current.lastName,
    address: address.address_1 || current.address,
    city: address.city || current.city,
    postcode: address.postal_code || current.postcode,
    country: normalizeCheckoutCountry(address.country_code),
    phone: address.phone || current.phone,
  }
}

function detailsToAddress(details: CheckoutDetails): Address {
  return {
    first_name: details.firstName,
    last_name: details.lastName,
    address_1: details.address,
    city: details.city,
    postal_code: details.postcode,
    country_code: details.country || "India",
    phone: details.phone,
  }
}

function addressTitle(address: Address) {
  return `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim() || "Saved address"
}

function validateCheckoutDetails(details: CheckoutDetails) {
  if (!isValidEmail(details.email)) return "Enter a valid email address."
  if (!isValidName(details.firstName, { required: true })) return "First name is required."
  if (!isValidName(details.lastName)) return "Enter a valid last name."
  if (!isValidPlainText(details.address, { required: true, min: 5, max: 180 })) return "Enter a complete shipping address."
  if (!isValidPlainText(details.city, { required: true, min: 2, max: 80 })) return "Enter a valid city."
  if (!isValidPostalCode(details.postcode, { required: true })) return "Enter a valid pincode."
  if (!isValidPhone(details.phone, { required: true })) return "Enter a valid mobile number."
  return null
}

export function CheckoutClient({ brand }: { brand: BrandConfig }) {
  // All money is in paise. Rates are admin-configurable (Store Settings).
  const FREE_SHIPPING_OVER = brand.free_shipping_threshold
  const STANDARD_RATE = brand.shipping_standard_rate
  const EXPRESS_RATE = brand.shipping_express_rate
  const enabledPayments = brand.enabled_payment_providers ?? ["razorpay"]
  const razorpayEnabled = enabledPayments.includes("razorpay")

  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const addOrder = useOrderStore((s) => s.add)
  const token = useAuthStore((s) => s.token)
  const customer = useAuthStore((s) => s.customer)
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [details, setDetails] = useState<CheckoutDetails>(blank)
  const [shipping, setShipping] = useState<Shipping>("standard")
  const [placing, setPlacing] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState("new")
  const [saveAddress, setSaveAddress] = useState(false)

  const [couponInput, setCouponInput] = useState("")
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null)
  const [couponBusy, setCouponBusy] = useState(false)

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const ship =
    shipping === "pickup" ? 0 : shipping === "express" ? EXPRESS_RATE : subtotal >= FREE_SHIPPING_OVER ? 0 : STANDARD_RATE
  const discount = Math.min(coupon?.discount ?? 0, subtotal)
  const total = Math.max(0, subtotal + ship - discount)

  const fetchSavedAddresses = useCallback(async () => {
    if (!customer) {
      setSavedAddresses([])
      setSelectedAddressId("new")
      setSaveAddress(false)
      return
    }
    setAddressesLoading(true)
    try {
      setSavedAddresses(await listAddresses(token || "customer_cookie"))
    } catch {
      setSavedAddresses([])
    } finally {
      setAddressesLoading(false)
    }
  }, [customer, token])

  useEffect(() => {
    if (!customer) return
    setDetails((current) => ({
      ...current,
      email: current.email || customer.email || "",
      firstName: current.firstName || customer.first_name || "",
      lastName: current.lastName || customer.last_name || "",
      phone: current.phone || customer.phone || "",
    }))
  }, [customer])

  useEffect(() => {
    void fetchSavedAddresses()
  }, [fetchSavedAddresses])

  const updateDetails = (key: DetailKey, value: string) => {
    setDetails((current) => ({ ...current, [key]: value }))
    if (ADDRESS_DETAIL_KEYS.includes(key)) {
      setSelectedAddressId("new")
      if (customer) setSaveAddress(true)
    }
  }

  const selectSavedAddress = (address: Address) => {
    setDetails((current) => addressToDetails(address, current))
    setSelectedAddressId(address.id ?? "saved")
    setSaveAddress(false)
  }

  const startNewAddress = () => {
    setSelectedAddressId("new")
    setSaveAddress(Boolean(customer))
    setDetails((current) => ({ ...current, address: "", city: "", postcode: "", country: current.country || "India" }))
  }

  if (items.length === 0) return <EmptyState />

  const detailsError = validateCheckoutDetails(details)
  const stepValid = step === 1 ? !detailsError : true

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
    const validationError = validateCheckoutDetails(details)
    if (validationError) {
      toast.error(validationError)
      setStep(1)
      return
    }
    if (!razorpayEnabled) {
      toast.error("No active payment gateway is configured")
      return
    }
    let orderId: string | null = null
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
      const createdOrderId = String(data.order.id)
      orderId = createdOrderId

      await openRazorpayCheckout({
        internalOrderId: createdOrderId,
        orderNumber: data.order.orderNumber,
        customer: details,
      })

      if (customer && saveAddress && selectedAddressId === "new") {
        await addAddress(token || "customer_cookie", detailsToAddress(details)).catch(() => {
          toast.error("Order placed, but the address could not be saved.")
        })
      }

      addOrder({ id: createdOrderId, details, items, total, shipping, payment: "razorpay", createdAt: Date.now() })
      clearCart()
      router.push(`/confirmation/${createdOrderId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed"
      toast.error(message)
      if (orderId) {
        await fetch("/api/payments/razorpay/failure", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ internalOrderId: orderId, description: message }),
        }).catch(() => null)
        setPlacing(false)
        router.push(`/payment-failed/${orderId}?reason=${encodeURIComponent(message)}`)
        return
      }
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
                {customer && (
                  <div className="border border-line bg-bg-2 p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Eyebrow className="mb-1 block">Saved addresses</Eyebrow>
                        <p className="text-[13px] text-muted">Fetch an address from your profile or add a new one for this order.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={fetchSavedAddresses}
                          className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink hover:border-accent hover:text-accent"
                        >
                          {addressesLoading ? "Fetching" : "Fetch"}
                        </button>
                        <Link href="/account/addresses" className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink hover:border-accent hover:text-accent">
                          Manage
                        </Link>
                      </div>
                    </div>

                    {savedAddresses.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {savedAddresses.map((address, index) => {
                          const active = selectedAddressId === (address.id ?? `saved-${index}`)
                          return (
                            <button
                              key={address.id ?? index}
                              type="button"
                              onClick={() => selectSavedAddress(address)}
                              className={`border p-4 text-left transition-colors ${active ? "border-accent bg-accent-soft" : "border-line bg-bg"}`}
                            >
                              <p className="font-display text-lg">{addressTitle(address)}</p>
                              <p className="mt-1 text-[13px] text-muted">{address.address_1}</p>
                              <p className="text-[13px] text-muted">
                                {address.city}{address.postal_code ? `, ${address.postal_code}` : ""}
                              </p>
                              {address.phone && <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">{address.phone}</p>}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="border border-dashed border-line px-4 py-5 text-sm text-muted">
                        {addressesLoading ? "Fetching saved addresses..." : "No saved addresses found. Add one below or manage addresses in your account."}
                      </p>
                    )}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={startNewAddress}
                        className="self-start font-mono text-[11px] uppercase tracking-widest text-accent underline underline-offset-4"
                      >
                        + Add new address
                      </button>
                      {selectedAddressId === "new" && (
                        <label className="flex items-center gap-2 text-[13px] text-muted">
                          <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="accent-[var(--accent)]" />
                          Save this address to my profile
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <Field label="Email" type="email" value={details.email} onChange={(v) => updateDetails("email", v)} placeholder="email@domain.com" />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label="First name" value={details.firstName} onChange={(v) => updateDetails("firstName", v)} />
                  <Field label="Last name" value={details.lastName} onChange={(v) => updateDetails("lastName", v)} />
                </div>
                <Field label="Address" value={details.address} onChange={(v) => updateDetails("address", v)} />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[2fr_1fr_1fr]">
                  <Field label="City" value={details.city} onChange={(v) => updateDetails("city", v)} />
                  <Field label="Pincode" inputMode="text" value={details.postcode} onChange={(v) => updateDetails("postcode", v)} />
                  <Field label="Country" value={details.country} onChange={(v) => updateDetails("country", v)} />
                </div>
                <Field label="Phone (Mobile)" type="tel" inputMode="tel" value={details.phone} onChange={(v) => updateDetails("phone", v)} placeholder="+91 ..." />
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
                {razorpayEnabled ? (
                  <>
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
                  </>
                ) : (
                  <div className="border border-line bg-bg-2 p-6">
                    <p className="font-display text-2xl">Payment unavailable</p>
                    <p className="mt-2 text-[13px] text-muted">Enable a payment gateway in admin settings before accepting checkout payments.</p>
                  </div>
                )}
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
              <Button
                onClick={() => {
                  if (detailsError) { toast.error(detailsError); return }
                  setStep((s) => s + 1)
                }}
                disabled={!stepValid}
              >
                Continue →
              </Button>
            </Magnetic>
          ) : (
            <Magnetic strength={0.15}>
              <Button onClick={handlePlace} disabled={!razorpayEnabled}>Place order — {priceFmt(total)}</Button>
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
  type = "text",
  inputMode,
}: {
  label: string
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"]
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
        type={type}
        inputMode={inputMode}
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
