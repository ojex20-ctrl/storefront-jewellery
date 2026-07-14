import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"
import { isValidEmail, normalizeEmailAddress } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`newsletter:${requestIp(req)}`, 10)) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  const body = await req.json().catch(() => ({}))
  const email = normalizeEmailAddress(body.email)
  const source = body.source ? String(body.source).replace(/[^a-z0-9_-]/gi, "").slice(0, 40) : "footer"
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
  await prisma.newsletterSubscriber.upsert({ where: { email }, update: { active: true }, create: { email, source, active: true } })
  return NextResponse.json({ ok: true, message: "You're subscribed — welcome to the list." }, { status: 201 })
}
