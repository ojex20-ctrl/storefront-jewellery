import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createOtp, normalizeEmail } from "@/lib/customer-auth"
import { sendEmail, verificationEmail } from "@/lib/email"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"

/**
 * Resend a signup verification OTP for an unverified account.
 * Always returns a generic 200 so it can't be used to probe which emails exist.
 */
export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`resend-otp:${requestIp(req)}`, 6)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }
  const { email: rawEmail } = await req.json().catch(() => ({}))
  const email = normalizeEmail(rawEmail ?? "")
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

  const customer = await prisma.customer.findUnique({ where: { email } }).catch(() => null)
  if (customer && !customer.verified) {
    const { code } = await createOtp(email, "register")
    const { subject, html } = verificationEmail(customer.firstName, code)
    await sendEmail({ to: email, subject, html }).catch(() => {})
  }

  return NextResponse.json({ ok: true, message: "If that account needs verification, we've sent a new code." })
}
