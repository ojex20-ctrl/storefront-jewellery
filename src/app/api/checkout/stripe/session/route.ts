import { NextResponse } from "next/server"

/**
 * Stripe Checkout session creator. In production proxies to Medusa, which
 * runs `stripe.checkout.sessions.create` with the cart line items and the
 * server-side secret. Returns `{ sessionId }` for the client to redirect.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { orderId: string; amount: number; currency: string }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return NextResponse.json({ sessionId: `cs_dev_${Date.now()}`, mode: "dev-stub" })
  }

  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!medusaUrl || !pubKey) {
    return NextResponse.json({ error: "Medusa not configured" }, { status: 500 })
  }

  const resp = await fetch(`${medusaUrl}/store/carts/payment-sessions/stripe`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": pubKey,
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    return NextResponse.json({ error: "Stripe session failed" }, { status: 502 })
  }
  const data = (await resp.json()) as { sessionId: string }
  return NextResponse.json({ sessionId: data.sessionId })
}
