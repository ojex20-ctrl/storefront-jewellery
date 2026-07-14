import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createPasswordResetToken, hasLocalPasswordHash, normalizeEmail } from "@/lib/customer-auth"
import { sendEmail, resetPasswordLinkEmail } from "@/lib/email"
import { isSupabaseConfigured, supabaseForgotPassword } from "@/lib/supabase-auth"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"
import { isValidEmail } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`forgot-password:${requestIp(req)}`, 8)) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  const { email: rawEmail } = await req.json().catch(() => ({}))
  const email = normalizeEmail(rawEmail ?? "")
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })
  if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })

  if (isSupabaseConfigured()) {
    await supabaseForgotPassword(email).catch(() => null)
    return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
  }

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer || !hasLocalPasswordHash(customer.passwordHash)) return NextResponse.json({ message: "If the email exists, a reset link has been sent." })

  const token = await createPasswordResetToken(customer.id)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://syrathelabel.com"
  const link = `${siteUrl}/account/reset-password?token=${encodeURIComponent(token)}`
  const { subject, html } = resetPasswordLinkEmail(customer.firstName, link)
  await sendEmail({ to: email, subject, html }).catch(() => {})
  return NextResponse.json({ message: "If the email exists, a reset link has been sent.", ...(process.env.NODE_ENV !== "production" && { resetLink: link }) })
}
