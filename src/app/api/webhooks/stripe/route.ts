import { NextResponse } from "next/server"

/**
 * Stripe → Medusa webhook proxy. Same shape as the Razorpay one above.
 * Configure Stripe's webhook URL as `https://<medusa-host>/hooks/payment/stripe`
 * directly when possible — proxying through Next adds a hop that can drop
 * the signature header on edge runtimes.
 */
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!medusaUrl) return NextResponse.json({ ok: false }, { status: 500 })
  const body = await req.arrayBuffer()
  const resp = await fetch(`${medusaUrl}/hooks/payment/stripe`, {
    method: "POST",
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json",
      "stripe-signature": req.headers.get("stripe-signature") ?? "",
    },
    body,
  })
  return new NextResponse(await resp.arrayBuffer(), {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") ?? "application/json" },
  })
}
