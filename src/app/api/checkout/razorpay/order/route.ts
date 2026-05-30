import { NextResponse } from "next/server"

/**
 * Razorpay order creation proxy.
 *
 * In production this calls Medusa's payment session endpoint
 * (`POST /store/payment-collections/:id/payment-sessions` with
 * `provider_id: "pp_razorpay_razorpay"`) — Medusa handles the secret
 * key call to Razorpay and returns the order id.
 *
 * For local dev without keys, we return a fake id so the UI can still flow.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { amount: number; currency: string; receipt: string }

  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  if (!medusaUrl || !pubKey || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    return NextResponse.json({ id: `order_dev_${Date.now()}`, mode: "dev-stub" })
  }

  // TODO: replace with real Medusa cart → payment-collection → session call
  // once the cart side of the storefront is fully Medusa-backed.
  const resp = await fetch(`${medusaUrl}/store/carts/payment-sessions/razorpay`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": pubKey,
    },
    body: JSON.stringify({
      amount: body.amount,
      currency: body.currency,
      receipt: body.receipt,
    }),
  })
  if (!resp.ok) {
    return NextResponse.json({ error: "Razorpay order failed" }, { status: 502 })
  }
  const data = (await resp.json()) as { id: string }
  return NextResponse.json({ id: data.id })
}
