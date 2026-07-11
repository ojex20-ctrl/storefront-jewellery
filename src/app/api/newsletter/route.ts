import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`newsletter:${requestIp(req)}`, 10)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160)
  const source = body.source ? String(body.source).slice(0, 40) : "footer"

  if (!/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { active: true },
    create: { email, source, active: true },
  })

  return NextResponse.json({ ok: true, message: "You're subscribed — welcome to the list." }, { status: 201 })
}
