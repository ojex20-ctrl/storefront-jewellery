/**
 * Stripe popup driver using Stripe Elements + the Medusa-issued
 * PaymentIntent client_secret.
 *
 * Medusa's bundled `payment-stripe` provider creates a PaymentIntent on
 * `initPaymentSession` and stores its `client_secret` on the session's
 * `data` field. We mount a small modal with Payment Element wired to
 * that secret, the customer fills card details / picks a wallet,
 * `confirmPayment` runs, the webhook flips Medusa's payment_status to
 * `captured`, and we resolve so the caller can `finalise()` the cart.
 *
 * No Stripe redirect — keeps the customer on our `/confirmation/:id`
 * page even on success. If `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is
 * blank we fall through to a dev stub so local smoke tests still
 * complete the order.
 */

import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js"

let stripePromise: Promise<Stripe | null> | null = null
function getStripe(): Promise<Stripe | null> {
  if (stripePromise) return stripePromise
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  stripePromise = key ? loadStripe(key) : Promise.resolve(null)
  return stripePromise
}

export type StripePopupArgs = {
  /** Medusa payment session.data — must contain `client_secret`. */
  sessionData: Record<string, unknown>
  amount: number
  currency: string
  brandName: string
  themeColor?: string
  customer: { name: string; email: string; phone: string }
}

export type StripePopupResult = {
  payment_intent_id: string
}

export async function openStripePopup(
  args: StripePopupArgs,
): Promise<StripePopupResult> {
  const clientSecret = (args.sessionData?.client_secret ??
    args.sessionData?.clientSecret) as string | undefined
  const intentId = (args.sessionData?.payment_intent_id ??
    args.sessionData?.id) as string | undefined

  const stripe = await getStripe()
  if (!stripe || !clientSecret) {
    // Dev fallback — let the order go through without a real Stripe charge.
    await new Promise((r) => setTimeout(r, 800))
    return { payment_intent_id: String(intentId ?? "pi_dev_stub") }
  }

  return new Promise<StripePopupResult>((resolve, reject) => {
    // Build the modal DOM imperatively so this driver works from any
    // React tree without forcing the caller to render a wrapper. We
    // tear it down on success/cancel.
    const root = document.createElement("div")
    root.setAttribute("data-stripe-popup", "")
    root.style.cssText = `
      position:fixed;inset:0;z-index:300;display:flex;align-items:center;
      justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
    `
    const card = document.createElement("div")
    card.style.cssText = `
      width:min(440px,calc(100vw - 2rem));background:#ffffff;color:#0e0e0c;
      border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,0.35);
      padding:24px;display:flex;flex-direction:column;gap:18px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
    `

    const header = document.createElement("div")
    header.style.cssText =
      "display:flex;align-items:flex-start;justify-content:space-between;gap:16px;"
    header.innerHTML = `
      <div>
        <p style="margin:0;font-family:monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(0,0,0,0.5);">${escape(args.brandName)} · checkout</p>
        <p style="margin:6px 0 0;font-size:22px;font-weight:600;letter-spacing:-0.01em;">Pay ${args.currency.toUpperCase()} ${args.amount.toFixed(2)}</p>
      </div>
      <button data-close style="border:0;background:transparent;font-size:22px;line-height:1;cursor:pointer;color:rgba(0,0,0,0.55);">×</button>
    `

    const elementMount = document.createElement("div")
    elementMount.style.minHeight = "120px"

    const errorEl = document.createElement("div")
    errorEl.style.cssText =
      "font-size:13px;color:#dc2626;display:none;background:#fee2e2;padding:8px 10px;border-radius:6px;"

    const submit = document.createElement("button")
    submit.textContent = `Pay ${args.currency.toUpperCase()} ${args.amount.toFixed(2)}`
    submit.style.cssText = `
      border:0;border-radius:10px;padding:13px 18px;font-weight:600;font-size:15px;
      background:${args.themeColor ?? "#635bff"};color:#ffffff;cursor:pointer;
      transition:opacity 0.2s;
    `

    const safeFooter = document.createElement("p")
    safeFooter.style.cssText =
      "margin:0;font-size:11px;color:rgba(0,0,0,0.5);text-align:center;"
    safeFooter.textContent = "Secured by Stripe · 256-bit SSL"

    card.append(header, elementMount, errorEl, submit, safeFooter)
    root.appendChild(card)
    document.body.appendChild(root)

    let elements: StripeElements | null = null
    let unmounted = false

    const cleanup = () => {
      if (unmounted) return
      unmounted = true
      root.remove()
    }

    const cancel = (msg: string) => {
      cleanup()
      reject(new Error(msg))
    }

    // Wire close
    header.querySelector<HTMLButtonElement>("[data-close]")?.addEventListener(
      "click",
      () => cancel("Stripe popup closed"),
    )
    root.addEventListener("click", (e) => {
      if (e.target === root) cancel("Stripe popup dismissed")
    })

    // Mount Payment Element
    try {
      elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: args.themeColor ?? "#635bff" },
        },
      })
      const payment = elements.create("payment", {
        layout: "tabs",
        defaultValues: {
          billingDetails: {
            name: args.customer.name,
            email: args.customer.email,
            phone: args.customer.phone,
          },
        },
      })
      payment.mount(elementMount)
    } catch (err) {
      cancel(err instanceof Error ? err.message : "Failed to load Stripe Elements")
      return
    }

    submit.addEventListener("click", async () => {
      if (!elements) return
      submit.disabled = true
      submit.style.opacity = "0.6"
      errorEl.style.display = "none"
      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          // We want to stay on the same page so the post-payment polling
          // loop can light up the badges. `redirect: "if_required"` only
          // forces a redirect for 3DS / bank flows.
          redirect: "if_required",
        })
        if (error) {
          errorEl.textContent = error.message ?? "Payment failed"
          errorEl.style.display = "block"
          submit.disabled = false
          submit.style.opacity = "1"
          return
        }
        cleanup()
        resolve({ payment_intent_id: paymentIntent?.id ?? intentId ?? "pi_unknown" })
      } catch (err) {
        errorEl.textContent =
          err instanceof Error ? err.message : "Payment failed"
        errorEl.style.display = "block"
        submit.disabled = false
        submit.style.opacity = "1"
      }
    })
  })
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
