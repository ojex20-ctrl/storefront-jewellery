/**
 * Razorpay client-side checkout helper.
 *
 * Razorpay is "client-popup" — the merchant server creates an order via
 * `POST /v1/orders`, returns the `order_id`, and the browser opens the
 * Razorpay popup with that id. On success the popup posts the payment id
 * back to the page; on the server side a webhook (handled by Medusa's
 * `medusa-payment-razorpay` plugin) confirms the payment.
 *
 * The local `/api/checkout/razorpay/order` route is a thin wrapper around
 * Medusa's payment session creation that we'll wire up once the cart flow
 * is fully Medusa-backed.
 */
type Customer = {
  email: string
  firstName: string
  lastName: string
  phone: string
}

type CheckoutArgs = {
  orderId: string
  amount: number
  currency: string
  customer: Customer
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, cb: (...args: unknown[]) => void) => void }
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
  handler?: (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

let scriptPromise: Promise<void> | null = null

/** Lazy-load the Razorpay checkout.js script and cache the promise. */
function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay needs the browser"))
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

export async function openRazorpayCheckout(args: CheckoutArgs): Promise<void> {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  if (!key) {
    // Dev fallback — let the order flow through without a real popup.
    await new Promise((r) => setTimeout(r, 1200))
    return
  }

  await loadScript()

  // 1. Create order on the backend (Medusa payment session). The route
  //    below is a placeholder — replace with real Medusa cart flow when
  //    backend is reachable.
  const orderResp = await fetch("/api/checkout/razorpay/order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      amount: Math.round(args.amount * 100),
      currency: args.currency,
      receipt: args.orderId,
    }),
  })
  if (!orderResp.ok) throw new Error("Failed to create Razorpay order")
  const { id: razorpayOrderId } = (await orderResp.json()) as { id: string }

  // 2. Open the popup
  return new Promise<void>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key,
      amount: Math.round(args.amount * 100),
      currency: args.currency,
      name: process.env.NEXT_PUBLIC_BRAND ?? "ZIORA",
      description: `Order ${args.orderId}`,
      order_id: razorpayOrderId,
      prefill: {
        name: `${args.customer.firstName} ${args.customer.lastName}`.trim(),
        email: args.customer.email,
        contact: args.customer.phone,
      },
      notes: { internalOrderId: args.orderId },
      theme: { color: "#ff4a1c" },
      handler: () => resolve(),
      modal: { ondismiss: () => reject(new Error("Razorpay popup dismissed")) },
    })
    rzp.open()
  })
}
