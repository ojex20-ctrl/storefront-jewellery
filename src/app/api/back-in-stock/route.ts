import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`bis:${requestIp(req)}`, 12)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }
  const { email: rawEmail, productId } = (await req.json().catch(() => ({}))) as { email?: string; productId?: string }
  const email = String(rawEmail ?? "").trim().toLowerCase()
  if (!email || !/.+@.+\..+/.test(email) || !productId) {
    return NextResponse.json({ error: "A valid email and product are required." }, { status: 400 })
  }

  // Store in a real, queryable model (uniqued per product+email) so a restock
  // job / admin can act on it — instead of the old Setting key-value hack.
  await prisma.backInStockSubscription.upsert({
    where: { productId_email: { productId, email } },
    update: { notified: false },
    create: { productId, email },
  })

  return NextResponse.json({ ok: true, message: "We'll email you when it's back." })
}
