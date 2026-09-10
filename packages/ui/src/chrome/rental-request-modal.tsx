"use client"
import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CalendarDays, ShieldCheck, Phone, Store, X, Sparkles, ArrowRight, Check, AlertCircle, FileText } from "lucide-react"

type IconProps = { className?: string; strokeWidth?: number }
const CalendarDaysIcon = CalendarDays as React.ElementType<IconProps>
const ShieldCheckIcon = ShieldCheck as React.ElementType<IconProps>
const PhoneIcon = Phone as React.ElementType<IconProps>
const StoreIcon = Store as React.ElementType<IconProps>
const XIcon = X as React.ElementType<IconProps>
const SparklesIcon = Sparkles as React.ElementType<IconProps>
const ArrowRightIcon = ArrowRight as React.ElementType<IconProps>
const CheckIcon = Check as React.ElementType<IconProps>
const AlertCircleIcon = AlertCircle as React.ElementType<IconProps>
const FileTextIcon = FileText as React.ElementType<IconProps>

/**
 * RentalRequestModal — high-value rental lead capture.
 *
 * We deliberately don't take payment online for rentals. The flow:
 *   1. Customer reviews rules + their dates
 *   2. They submit name + phone + email + ID proof
 *   3. They pick "I'll visit the shop" or "Call me back"
 *   4. We POST /store/rental-requests, get a reference
 *   5. Show success screen with the reference + what to bring
 *
 * Brand-themed via CSS variables (`bg`, `accent`, `line`, `ink`, `muted`)
 * so SYRA and ZIORA both render in their own palette without forking.
 *
 * The modal is a *full-page* sheet on mobile and a centred dialog on
 * desktop. Date math, duration tabs, and live total mirror the now-
 * removed inline RentalPanel — but everything sits inside the modal so
 * the customer's product detail page never gets cluttered.
 */

export type RentalRequestProduct = {
  id: string
  handle: string
  title: string
  variant_title?: string | null
  image?: string | null
  daily_rate: number
  security_deposit: number
  durations: number[]
  notes?: string | null
}

export type RentalRequestModalProps = {
  open: boolean
  onClose: () => void
  product: RentalRequestProduct
  /** Brand handle — sent to /store/rental-requests so the admin and
   *  email subscriber can route correctly. */
  brand: string
  /** Backend URL + publishable key for the POST. Required. */
  backend: string
  publishableKey: string
  /** Per-brand currency formatter (defaults to AED). */
  formatPrice?: (n: number) => string
  /** Optional pre-fill for the customer fields (e.g. when logged in). */
  defaultCustomer?: {
    name?: string
    email?: string
    phone?: string
  }
  /** Optional copy overrides. The defaults are sensible across brands. */
  rules?: string[]
  /** Brand-specific accent label (e.g. "✦ Rent" / "★ Reserve"). */
  ctaLabel?: string
}

type IdType = "emirates_id" | "passport" | "uae_license" | "other"
type ContactMethod = "visit_shop" | "call_me"

const DEFAULT_RULES = [
  "Bring a valid government-issued ID (Emirates ID, passport, or UAE driving license).",
  "The refundable security deposit is paid in cash or bank transfer at the shop — never online.",
  "Collect + return at the shop or coordinate doorstep within the GCC.",
  "Late returns are billed daily; lost or damaged pieces are deducted from the deposit at full retail value.",
  "Pieces are sanitised, restrung, and quality-checked between renters.",
  "Deposit is refunded in full within 5 working days of return + inspection.",
]

export function RentalRequestModal({
  open,
  onClose,
  product,
  brand,
  backend,
  publishableKey,
  formatPrice,
  defaultCustomer,
  rules,
  ctaLabel = "Send rental request",
}: RentalRequestModalProps) {
  const fmt = formatPrice ?? ((n) => `AED ${n.toLocaleString()}`)
  const allRules = rules ?? DEFAULT_RULES

  // ─── Window ─────────────────────────────────────────────────────────
  const [days, setDays] = React.useState<number>(product.durations[0] ?? 3)
  const [startDate, setStartDate] = React.useState<string>(() =>
    iso(nextFriday()),
  )
  const endDate = React.useMemo(() => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + days)
    return iso(d)
  }, [startDate, days])
  const today = iso(new Date())

  // ─── Customer ───────────────────────────────────────────────────────
  const [name, setName] = React.useState(defaultCustomer?.name ?? "")
  const [email, setEmail] = React.useState(defaultCustomer?.email ?? "")
  const [phone, setPhone] = React.useState(defaultCustomer?.phone ?? "")
  const [idType, setIdType] = React.useState<IdType>("emirates_id")
  const [idNumber, setIdNumber] = React.useState("")
  const [contactMethod, setContactMethod] =
    React.useState<ContactMethod>("visit_shop")
  const [preferredTime, setPreferredTime] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [acceptedRules, setAcceptedRules] = React.useState(false)

  // ─── Submission ─────────────────────────────────────────────────────
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<{
    reference: string
    contact_method: ContactMethod
  } | null>(null)

  // Reset transient state when the modal opens again on a new product.
  React.useEffect(() => {
    if (!open) return
    setSuccess(null)
    setError(null)
    setSubmitting(false)
    setDays(product.durations[0] ?? 3)
    setStartDate(iso(nextFriday()))
  }, [open, product.id, product.durations])

  // Lock body scroll while modal is open.
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const rentalFee = product.daily_rate * days
  const indicativeTotal = rentalFee + product.security_deposit

  const submit = async () => {
    setError(null)
    if (!acceptedRules) {
      setError("Please confirm you've read the rental rules.")
      return
    }
    if (!name.trim() || !email.trim() || !phone.trim() || !idNumber.trim()) {
      setError("Please fill in your name, email, phone, and ID number.")
      return
    }
    setSubmitting(true)
    try {
      const r = await fetch(`${backend}/store/rental-requests`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          brand,
          product_id: product.id,
          product_handle: product.handle,
          product_title: product.title,
          variant_title: product.variant_title ?? null,
          product_image: product.image ?? null,
          start_date: startDate,
          end_date: endDate,
          days,
          daily_rate: product.daily_rate,
          security_deposit: product.security_deposit,
          rental_fee: rentalFee,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          id_type: idType,
          id_number: idNumber.trim(),
          contact_method: contactMethod,
          preferred_time: preferredTime.trim() || null,
          message: message.trim() || null,
        }),
      })
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as {
          error?: string
          issues?: string[]
        }
        throw new Error(body.issues?.join(", ") ?? body.error ?? "Could not submit request.")
      }
      const j = (await r.json()) as {
        rental_request: { reference: string; contact_method: ContactMethod }
      }
      setSuccess({
        reference: j.rental_request.reference,
        contact_method: j.rental_request.contact_method,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit request.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim — sits behind the modal, dims the rest of the page. */}
          <motion.div
            key="rrm-scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md"
          />
          {/* Centering layer — flex centers the card on desktop, fills the
              viewport on mobile. p-0 mobile, padding on md so the card
              doesn't touch the viewport edges. */}
          <motion.div
            key="rrm-modal"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-0 z-[201] flex items-stretch justify-center md:items-center md:p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex min-h-0 w-full flex-col overflow-hidden bg-bg shadow-2xl md:max-h-[calc(100vh-3rem)] md:w-[min(960px,calc(100vw-3rem))] md:rounded-[28px] md:border md:border-line"
              style={{
                // Brand-aware ambient tint — color-mix uses the active CSS
                // variable accent so SYRA glows magenta/lime, ZIORA glows
                // gold/orange, etc.
                backgroundImage: [
                  "radial-gradient(700px 500px at 0% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%)",
                  "radial-gradient(700px 500px at 100% 100%, color-mix(in srgb, var(--accent-2, var(--accent)) 18%, transparent), transparent 60%)",
                ].join(","),
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* HEADER */}
              <div className="relative flex items-start justify-between gap-4 border-b border-line bg-bg-2/60 px-5 py-4 backdrop-blur md:px-8 md:py-6">
                <div>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
                    <SparklesIcon className="h-3 w-3" strokeWidth={1.8} />
                    Rental request · by appointment
                  </span>
                  <h2
                    className="mt-2 font-display tracking-tighter"
                    style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1 }}
                  >
                    {success ? "Request received." : product.title}
                  </h2>
                  {!success && (
                    <p className="mt-1 text-xs text-muted">
                      We don't take payment online — submit your details and we'll be in touch.
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 rounded-full border border-line bg-bg p-2 text-muted hover:border-accent hover:text-accent"
                >
                  <XIcon className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>

              {/* SUCCESS STATE */}
              {success ? (
                <SuccessView
                  reference={success.reference}
                  contactMethod={success.contact_method}
                  product={product}
                  startDate={startDate}
                  endDate={endDate}
                  days={days}
                  rentalFee={rentalFee}
                  formatPrice={fmt}
                  onClose={onClose}
                />
              ) : (
                /* FORM */
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className="grid gap-8 p-5 md:grid-cols-[1fr_320px] md:gap-10 md:p-8">
                    <div className="flex flex-col gap-8">
                      {/* RULES */}
                      <Section
                        icon={<FileTextIcon className="h-4 w-4 text-accent" strokeWidth={1.8} />}
                        title="Before you submit"
                        subtitle="Six things to know about renting from us."
                      >
                        <ul className="grid gap-2.5 md:grid-cols-2">
                          {allRules.map((r, i) => (
                            <li
                              key={i}
                              className="flex gap-2.5 rounded-2xl border border-line bg-bg-2 p-3 text-sm leading-relaxed text-ink-2"
                            >
                              <CheckIcon
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                                strokeWidth={2.2}
                              />
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                        <label className="mt-4 flex items-start gap-2.5 text-sm text-ink-2">
                          <input
                            type="checkbox"
                            checked={acceptedRules}
                            onChange={(e) => setAcceptedRules(e.target.checked)}
                            className="mt-1 h-4 w-4 accent-accent"
                          />
                          <span>
                            I've read the rental rules and understand the deposit + ID
                            requirement.
                          </span>
                        </label>
                      </Section>

                      {/* DATES */}
                      <Section
                        icon={<CalendarDaysIcon className="h-4 w-4 text-accent" strokeWidth={1.8} />}
                        title="Pickup window"
                        subtitle="Pick a duration first, then your start date."
                      >
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                          Duration
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.durations.map((d) => (
                            <button
                              key={d}
                              onClick={() => setDays(d)}
                              className={`rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
                                days === d
                                  ? "border-accent bg-accent text-bg"
                                  : "border-line bg-bg text-ink hover:border-accent hover:text-accent"
                              }`}
                            >
                              {d} day{d === 1 ? "" : "s"}
                            </button>
                          ))}
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <Field label="Pickup date">
                            <input
                              type="date"
                              min={today}
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full rounded-full border border-line bg-bg px-4 py-2.5 font-mono text-sm uppercase tracking-widest text-ink outline-none focus:border-accent"
                            />
                          </Field>
                          <Field label="Return by">
                            <input
                              type="date"
                              value={endDate}
                              readOnly
                              className="w-full cursor-not-allowed rounded-full border border-line bg-bg-2 px-4 py-2.5 font-mono text-sm uppercase tracking-widest text-muted outline-none"
                            />
                          </Field>
                        </div>
                      </Section>

                      {/* CUSTOMER DETAILS */}
                      <Section
                        icon={<ShieldCheckIcon className="h-4 w-4 text-accent" strokeWidth={1.8} />}
                        title="Your details"
                        subtitle="So we can confirm the booking. We never share these."
                      >
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Full name">
                            <Input value={name} onChange={setName} placeholder="As on your ID" />
                          </Field>
                          <Field label="Email">
                            <Input
                              value={email}
                              onChange={setEmail}
                              type="email"
                              placeholder="you@email.com"
                            />
                          </Field>
                          <Field label="Phone (with country code)">
                            <Input
                              value={phone}
                              onChange={setPhone}
                              type="tel"
                              placeholder="+971 50 …"
                            />
                          </Field>
                          <Field label="ID type">
                            <select
                              value={idType}
                              onChange={(e) => setIdType(e.target.value as IdType)}
                              className="w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
                            >
                              <option value="emirates_id">Emirates ID</option>
                              <option value="passport">Passport</option>
                              <option value="uae_license">UAE driving license</option>
                              <option value="other">Other</option>
                            </select>
                          </Field>
                          <Field label="ID number" hint="Bring the original at pickup.">
                            <Input
                              value={idNumber}
                              onChange={setIdNumber}
                              placeholder={
                                idType === "emirates_id" ? "784-XXXX-XXXXXXX-X" : "ID / Passport #"
                              }
                            />
                          </Field>
                        </div>
                      </Section>

                      {/* CONTACT PREFERENCE */}
                      <Section
                        icon={<PhoneIcon className="h-4 w-4 text-accent" strokeWidth={1.8} />}
                        title="How would you like to confirm?"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <ContactCard
                            active={contactMethod === "visit_shop"}
                            onClick={() => setContactMethod("visit_shop")}
                            icon={<StoreIcon className="h-5 w-5" strokeWidth={1.6} />}
                            title="I'll visit the shop"
                            sub="Bring ID + deposit, leave with the piece."
                          />
                          <ContactCard
                            active={contactMethod === "call_me"}
                            onClick={() => setContactMethod("call_me")}
                            icon={<PhoneIcon className="h-5 w-5" strokeWidth={1.6} />}
                            title="Call me back"
                            sub="We'll confirm the booking and walk you through next steps."
                          />
                        </div>
                        {contactMethod === "call_me" && (
                          <div className="mt-4">
                            <Field
                              label="Best time to call"
                              hint="Free-form — e.g. 'weekday evening', '10–12 GST'."
                            >
                              <Input
                                value={preferredTime}
                                onChange={setPreferredTime}
                                placeholder="weekday evenings"
                              />
                            </Field>
                          </div>
                        )}
                        <div className="mt-4">
                          <Field label="Anything else? (optional)">
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={3}
                              placeholder="Event date, alternate dates, sizing notes, etc."
                              className="w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
                            />
                          </Field>
                        </div>
                      </Section>
                    </div>

                    {/* SUMMARY RAIL */}
                    <aside className="self-start rounded-[24px] border border-line bg-bg-2 p-5 md:sticky md:top-4">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                        Indicative summary
                      </p>
                      <div className="mt-3 flex items-start gap-3">
                        {product.image && (
                          <div
                            className="aspect-square w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-cover bg-center"
                            style={{ backgroundImage: `url(${product.image})` }}
                          />
                        )}
                        <div>
                          <p className="font-display text-lg leading-tight">{product.title}</p>
                          {product.variant_title && (
                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                              {product.variant_title}
                            </p>
                          )}
                        </div>
                      </div>

                      <dl className="mt-5 divide-y divide-line text-sm">
                        <SummaryRow k={`${fmt(product.daily_rate)} × ${days} day${days === 1 ? "" : "s"}`} v={fmt(rentalFee)} />
                        <SummaryRow
                          k="Refundable deposit"
                          v={fmt(product.security_deposit)}
                          muted
                        />
                        <SummaryRow k="Pickup" v={prettyDate(startDate)} muted />
                        <SummaryRow k="Return by" v={prettyDate(endDate)} muted />
                      </dl>
                      <div className="mt-4 rounded-xl border border-line bg-bg p-3 text-xs leading-relaxed text-muted">
                        <strong className="text-ink-2">Indicative total at the shop:</strong>{" "}
                        {fmt(indicativeTotal)}.<br />
                        <span className="text-muted">
                          Final amount confirmed when we contact you.
                        </span>
                      </div>

                      {product.notes && (
                        <p className="mt-4 text-xs italic leading-relaxed text-muted">
                          {product.notes}
                        </p>
                      )}
                    </aside>
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="sticky bottom-0 flex flex-col gap-3 border-t border-line bg-bg/95 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">
                    <div className="flex items-start gap-2 text-xs text-muted">
                      <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.8} />
                      <span>
                        We'll never share your contact or ID details. Deposit + ID are exchanged at the shop only.
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {error && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircleIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                          {error}
                        </span>
                      )}
                      <button
                        onClick={onClose}
                        type="button"
                        className="border border-line bg-bg px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent md:rounded-full"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => void submit()}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-bg transition-colors hover:bg-bg hover:text-accent disabled:opacity-60"
                      >
                        {submitting ? "Sending…" : ctaLabel}
                        {!submitting && (
                          <ArrowRightIcon className="h-3.5 w-3.5" strokeWidth={2.2} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Subcomponents ───────────────────────────────────────────────────

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-line bg-bg-2">
          {icon}
        </span>
        <div>
          <h3 className="font-display text-xl tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  )
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
    />
  )
}

function ContactCard({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  sub: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        active
          ? "border-accent bg-accent/10"
          : "border-line bg-bg hover:border-accent"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          active ? "bg-accent text-bg" : "bg-bg-2 text-ink-2"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block font-display text-base">{title}</span>
        <span className="mt-0.5 block text-xs text-muted">{sub}</span>
      </span>
    </button>
  )
}

function SummaryRow({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-2 font-mono text-xs ${
        muted ? "text-muted" : "text-ink-2"
      }`}
    >
      <span>{k}</span>
      <span>{v}</span>
    </div>
  )
}

function SuccessView({
  reference,
  contactMethod,
  product,
  startDate,
  endDate,
  days,
  rentalFee,
  formatPrice,
  onClose,
}: {
  reference: string
  contactMethod: ContactMethod
  product: RentalRequestProduct
  startDate: string
  endDate: string
  days: number
  rentalFee: number
  formatPrice: (n: number) => string
  onClose: () => void
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex max-w-[640px] flex-col items-center px-5 py-12 text-center md:py-16">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-accent/15">
          <CheckIcon className="h-8 w-8 text-accent" strokeWidth={2.2} />
        </div>
        <p
          className="mt-6 font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1 }}
        >
          We're on it.
        </p>
        <p className="mt-3 max-w-[520px] text-base leading-relaxed text-ink-2">
          {contactMethod === "visit_shop"
            ? "Walk into the shop with your ID and the refundable deposit. Quote this reference at the counter — we'll have the piece ready."
            : "We'll call you back within one working day to confirm the rental and walk you through next steps."}
        </p>

        <div className="mt-8 inline-flex flex-col items-center gap-1 rounded-3xl border border-accent/40 bg-accent/5 px-8 py-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Your reference
          </span>
          <span className="font-display text-3xl tracking-tight text-accent">
            {reference}
          </span>
        </div>

        <dl className="mt-8 grid w-full max-w-[480px] grid-cols-2 gap-3 text-left text-sm">
          <SuccessRow k="Piece" v={product.title} />
          <SuccessRow
            k="Window"
            v={`${prettyDate(startDate)} → ${prettyDate(endDate)} (${days}d)`}
          />
          <SuccessRow k="Rental fee" v={formatPrice(rentalFee)} />
          <SuccessRow
            k="Deposit at shop"
            v={formatPrice(product.security_deposit)}
          />
        </dl>

        <p className="mt-8 max-w-[520px] text-xs text-muted">
          A confirmation email is on its way. Check the spam folder if you don't see it
          within a few minutes.
        </p>

        <button
          onClick={onClose}
          className="mt-8 rounded-full border border-accent bg-accent px-6 py-2.5 font-mono text-[11px] uppercase tracking-widest text-bg transition-colors hover:bg-bg hover:text-accent"
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SuccessRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg-2 p-3">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">
        {k}
      </span>
      <span className="mt-0.5 block text-sm">{v}</span>
    </div>
  )
}

// ─── Date helpers ────────────────────────────────────────────────────

function nextFriday(): Date {
  const d = new Date()
  const delta = (5 - d.getDay() + 7) % 7 || 7
  d.setDate(d.getDate() + delta)
  d.setHours(0, 0, 0, 0)
  return d
}

function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function prettyDate(s: string): string {
  return new Date(s).toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}
