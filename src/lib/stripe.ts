import { loadStripe } from "@stripe/stripe-js"

/**
 * Stripe is wired via Stripe Checkout (hosted page) for international cards
 * and Apple Pay. The browser hits `/api/checkout/stripe/session`, the route
 * calls Medusa's payment session API (which talks to Stripe), and we
 * redirect to the returned URL.
 */
let stripePromise: ReturnType<typeof loadStripe> | null = null

function stripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    stripePromise = key ? loadStripe(key) : Promise.resolve(null)
  }
  return stripePromise
}

export async function redirectToStripeCheckout(args: {
  orderId: string
  amount: number
  currency: string
}): Promise<void> {
  const s = await stripe()
  if (!s) {
    // Dev fallback — pretend the popup succeeded.
    await new Promise((r) => setTimeout(r, 1200))
    return
  }

  const resp = await fetch("/api/checkout/stripe/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      orderId: args.orderId,
      amount: Math.round(args.amount * 100),
      currency: args.currency.toLowerCase(),
    }),
  })
  if (!resp.ok) throw new Error("Failed to create Stripe session")
  const { sessionId } = (await resp.json()) as { sessionId: string }

  const { error } = await s.redirectToCheckout({ sessionId })
  if (error) throw new Error(error.message ?? "Stripe redirect failed")
}
