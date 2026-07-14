import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"
import { isValidEmail, isValidName, isValidPhone, isValidPlainText } from "@/lib/validation"

const TYPES = ["contact", "bespoke", "atelier", "rental"]

function escapeHtml(value: string) {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }
  return value.replace(/[&<>"]/g, (char) => map[char] ?? char)
}

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`contact:${requestIp(req)}`, 8)) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 })
  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? "").trim().slice(0, 80)
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160)
  const phone = body.phone ? String(body.phone).trim().slice(0, 30) : null
  const subject = body.subject ? String(body.subject).trim().slice(0, 160) : null
  const message = String(body.message ?? "").trim().slice(0, 4000)
  const type = TYPES.includes(body.type) ? body.type : "contact"

  if (!isValidName(name, { required: true })) return NextResponse.json({ error: "Enter your name." }, { status: 400 })
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 })
  if (!isValidPhone(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })
  if (!isValidPlainText(message, { required: true, min: 10, max: 4000 })) return NextResponse.json({ error: "Enter a message with at least 10 characters." }, { status: 400 })

  const msg = await prisma.contactMessage.create({ data: { name, email, phone, subject, message, type } })
  const to = process.env.ADMIN_ORDER_ALERT_EMAIL
  if (to) {
    await sendEmail({
      to,
      subject: `New ${type} enquiry from ${name}`,
      html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;${phone ? ` · ${escapeHtml(phone)}` : ""}</p>${subject ? `<p><strong>${escapeHtml(subject)}</strong></p>` : ""}<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }).catch(() => {})
  }
  return NextResponse.json({ ok: true, id: msg.id, message: "Thanks — we'll be in touch soon." }, { status: 201 })
}
