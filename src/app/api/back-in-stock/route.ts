import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"
import { isValidEmail, isValidSlug, normalizeEmailAddress, normalizeSlug } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`bis:${requestIp(req)}`, 12)) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  const { email: rawEmail, productId: rawProductId } = (await req.json().catch(() => ({}))) as { email?: string; productId?: string }
  const email = normalizeEmailAddress(rawEmail)
  const productId = normalizeSlug(rawProductId)
  if (!isValidEmail(email) || !isValidSlug(productId)) return NextResponse.json({ error: "A valid email and product are required." }, { status: 400 })
  const product = await prisma.product.findUnique({ where: { slug: productId }, select: { id: true } })
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 })
  await prisma.backInStockSubscription.upsert({ where: { productId_email: { productId, email } }, update: { notified: false }, create: { productId, email } })
  return NextResponse.json({ ok: true, message: "We'll email you when it's back." })
}
