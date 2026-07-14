import { NextResponse } from "next/server"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isNonNegativeMoney, isValidSlug, normalizeSlug } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const body = await req.json().catch(() => null)
  const items = Array.isArray(body?.items) ? body.items : []
  if (items.length === 0 || items.length > 50 || items.some((item: { productId?: unknown; qty?: unknown; price?: unknown }) => {
    const productId = normalizeSlug(item?.productId)
    const qty = Number(item?.qty ?? 1)
    const price = Number(item?.price ?? 0)
    return !isValidSlug(productId) || !Number.isInteger(qty) || qty < 1 || qty > 99 || !Number.isInteger(price) || !isNonNegativeMoney(price)
  })) {
    return NextResponse.json({ error: "Valid cart items are required" }, { status: 400 })
  }
  const notificationsUrl = process.env.SYRA_NOTIFICATIONS_URL
  if (notificationsUrl) {
    const resp = await fetch(`${notificationsUrl.replace(/\/$/, "")}/api/marketing/abandoned-cart`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null)
    if (resp?.ok) return NextResponse.json({ ok: true, queued: true })
  }
  return NextResponse.json({
    ok: true,
    queued: false,
    message: "Cart payload accepted. Connect this route to syra-notifications for email automation.",
  })
}
