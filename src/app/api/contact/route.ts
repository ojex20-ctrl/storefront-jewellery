import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"

const TYPES = ["contact", "bespoke", "atelier", "rental"]

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`contact:${requestIp(req)}`, 8)) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? "").trim().slice(0, 80)
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160)
  const phone = body.phone ? String(body.phone).trim().slice(0, 30) : null
  const subject = body.subject ? String(body.subject).trim().slice(0, 160) : null
  const message = String(body.message ?? "").trim().slice(0, 4000)
  const type = TYPES.includes(body.type) ? body.type : "contact"

  if (!name || !email || !/.+@.+\..+/.test(email) || !message) {
    return NextResponse.json({ error: "Name, a valid email, and a message are required." }, { status: 400 })
  }

  const msg = await prisma.contactMessage.create({
    data: { name, email, phone, subject, message, type },
  })

  // Notify the store inbox if an alert address is configured.
  const to = process.env.ADMIN_ORDER_ALERT_EMAIL
  if (to) {
    await sendEmail({
      to,
      subject: `New ${type} enquiry from ${name}`,
      html: `<p><strong>${name}</strong> &lt;${email}&gt;${phone ? ` · ${phone}` : ""}</p>${subject ? `<p><strong>${subject}</strong></p>` : ""}<p>${message.replace(/\n/g, "<br>")}</p>`,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true, id: msg.id, message: "Thanks — we'll be in touch soon." }, { status: 201 })
}
