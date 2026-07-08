import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.items?.length) {
    return NextResponse.json({ error: "No cart items provided" }, { status: 400 })
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
