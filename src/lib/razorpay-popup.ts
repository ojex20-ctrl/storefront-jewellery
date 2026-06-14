/**
 * Razorpay popup driver for the Medusa-driven checkout.
 *
 * Once a Medusa payment session is initialised against the Razorpay
 * provider, the session's `data` field carries the Razorpay order id our
 * backend created. We feed that into the browser popup and resolve when
 * the customer pays (or reject if they dismiss).
 *
 * Webhook-side capture is handled by the Razorpay module's
 * `getWebhookActionAndData()` — by the time the popup resolves on the
 * client, Medusa's payment_status will flip to "captured" within a few
 * seconds and the order is created.
 */

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void
      on: (event: string, cb: (...args: unknown[]) => void) => void
    }
  }
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id?: string
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  theme?: { color?: string }
  handler?: (resp: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
  modal?: { ondismiss?: () => void }
}

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("Razorpay needs the browser"))
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = "https://checkout.razorpay.com/v1/checkout.js"
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      scriptPromise = null
      reject(new Error("Failed to load Razorpay"))
    }
    document.body.appendChild(s)
  })
  return scriptPromise
}

export type RazorpayPopupArgs = {
  /** Medusa payment session.data — Razorpay order id is in `id` or
   *  `order_id` depending on the module version. */
  sessionData: Record<string, unknown>
  amount: number
  currency: string
  brandName: string
  description?: string
  customer: { name: string; email: string; phone: string }
  themeColor?: string
}

export type RazorpayPopupResult = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export async function openRazorpayPopup(
  args: RazorpayPopupArgs,
): Promise<RazorpayPopupResult> {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  if (!key) {
    // Dev fallback — let the order flow through without a real popup so
    // local dev (without keys) can still smoke-test the rest of the
    // pipeline. Returns dummy ids; admin will see "captured" via webhook
    // only when real keys are configured.
    await new Promise((r) => setTimeout(r, 800))
    return {
      razorpay_payment_id: "pay_dev_stub",
      razorpay_order_id: String(
        (args.sessionData?.id as string | undefined) ??
          (args.sessionData?.order_id as string | undefined) ??
          "order_dev_stub",
      ),
      razorpay_signature: "dev_stub_signature",
    }
  }

  await loadScript()

  // Razorpay needs the order id from Medusa's session data. The custom
  // module stores it on `id` (this codebase's module) — fall back to
  // `order_id` for safety.
  const orderId =
    (args.sessionData?.id as string | undefined) ??
    (args.sessionData?.order_id as string | undefined) ??
    null
  if (!orderId) throw new Error("Missing Razorpay order id in payment session data")

  return new Promise<RazorpayPopupResult>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key,
      amount: Math.round(args.amount * 100),
      currency: args.currency,
      name: args.brandName,
      description: args.description ?? "",
      order_id: orderId,
      prefill: {
        name: args.customer.name,
        email: args.customer.email,
        contact: args.customer.phone,
      },
      theme: { color: args.themeColor ?? "#ff4a1c" },
      handler: (resp) => resolve(resp),
      modal: {
        ondismiss: () =>
          reject(new Error("Razorpay popup dismissed before payment.")),
      },
    })
    rzp.open()
  })
}
