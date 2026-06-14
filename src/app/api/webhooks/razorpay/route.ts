import { NextResponse } from "next/server"

/**
 * Razorpay forwards events directly to Medusa (configure the webhook URL
 * in the Razorpay dashboard as `https://<your-medusa-host>/hooks/payment/razorpay`).
 *
 * This handler is a thin pass-through used only when you'd like to receive
 * events on the storefront domain (e.g. for analytics) — it forwards the
 * raw body and signature header on to Medusa untouched so signature
 * verification stays valid.
 */
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!medusaUrl) return NextResponse.json({ ok: false }, { status: 500 })

  const body = await req.arrayBuffer()
  const resp = await fetch(`${medusaUrl}/hooks/payment/razorpay`, {
    method: "POST",
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json",
      "x-razorpay-signature": req.headers.get("x-razorpay-signature") ?? "",
    },
    body,
  })
  return new NextResponse(await resp.arrayBuffer(), {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") ?? "application/json" },
  })
}
