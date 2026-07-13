type Customer = {
  email: string
  firstName: string
  lastName: string
  phone: string
}

type CheckoutArgs = {
  internalOrderId: string
  orderNumber: number
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
let scriptSrc: string | null = null

function loadScript(src = "https://checkout.razorpay.com/v1/checkout.js"): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay needs the browser"))
  if (window.Razorpay && scriptSrc === src) return Promise.resolve()
  if (scriptPromise && scriptSrc === src) return scriptPromise

  scriptSrc = src
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      scriptPromise = null
      scriptSrc = null
      reject(new Error("Failed to load Razorpay"))
    }
    document.body.appendChild(s)
  })
  return scriptPromise
}

export async function openRazorpayCheckout(args: CheckoutArgs): Promise<void> {
  const orderResp = await fetch("/api/payments/razorpay/create-order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderId: args.internalOrderId }),
  })
  const orderData = await orderResp.json() as { error?: string; keyId: string; amount: number; currency: string; orderId: string; brandName?: string; themeColor?: string; checkoutScriptUrl?: string }
  if (!orderResp.ok) throw new Error(orderData.error || "Failed to create Razorpay order")

  await loadScript(orderData.checkoutScriptUrl)

  return new Promise<void>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: orderData.brandName ?? "SYRA",
      description: `Order #${args.orderNumber}`,
      order_id: orderData.orderId,
      prefill: {
        name: `${args.customer.firstName} ${args.customer.lastName}`.trim(),
        email: args.customer.email,
        contact: args.customer.phone,
      },
      notes: { internalOrderId: args.internalOrderId },
      theme: { color: orderData.themeColor ?? "#c9a36b" },
      handler: async (resp) => {
        const verifyResp = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ internalOrderId: args.internalOrderId, ...resp }),
        })
        const verifyData = await verifyResp.json().catch(() => ({}))
        if (!verifyResp.ok) {
          reject(new Error(verifyData.error || "Payment verification failed"))
          return
        }
        resolve()
      },
      modal: { ondismiss: () => reject(new Error("Razorpay popup dismissed")) },
    })
    rzp.open()
  })
}
