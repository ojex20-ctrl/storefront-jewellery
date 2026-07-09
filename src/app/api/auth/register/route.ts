import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  createEmailVerificationToken,
  hashPassword,
  isStrongPassword,
  isValidPhone,
  normalizeEmail,
  sanitizeName,
  sanitizePhone,
} from "@/lib/customer-auth"
import { sendEmail, verificationLinkEmail } from "@/lib/email"
import { isSupabaseConfigured, supabaseSignUp } from "@/lib/supabase-auth"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`customer-register:${requestIp(req)}`, 6)) {
    return NextResponse.json({ error: "Too many registrations. Try again later." }, { status: 429 })
  }
  const body = await req.json()
  const firstName = sanitizeName(body.firstName ?? "")
  const lastName = sanitizeName(body.lastName ?? "")
  const email = normalizeEmail(body.email ?? "")
  const phone = sanitizePhone(body.phone ?? "")
  const password = String(body.password ?? "")
  const confirmPassword = String(body.confirmPassword ?? "")
  const acceptTerms = Boolean(body.acceptTerms)

  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }
  if (!acceptTerms) return NextResponse.json({ error: "Please accept the terms." }, { status: 400 })
  if (!isValidPhone(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
  }
  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: "Password must be 8+ characters with uppercase, lowercase, and a number." }, { status: 400 })
  }

  if (isSupabaseConfigured()) {
    try {
      const auth = await supabaseSignUp({ email, password, firstName, lastName, phone })
      await prisma.customer.upsert({
        where: { email },
        update: { firstName, lastName, phone, verified: false },
        create: { email, passwordHash: "supabase", firstName, lastName, phone, verified: false },
      })
      return NextResponse.json({
        message: auth.access_token
          ? "Account created."
          : "Account created. Check your email to confirm your account.",
      })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Registration failed" }, { status: 400 })
    }
  }

  const existing = await prisma.customer.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const customer = await prisma.customer.create({
    data: { email, passwordHash, firstName, lastName, phone, verified: false }
  })

  const token = await createEmailVerificationToken(customer.id)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin
  const link = `${siteUrl}/account/verify?token=${encodeURIComponent(token)}`
  const { subject, html } = verificationLinkEmail(firstName, link)
  await sendEmail({ to: email, subject, html }).catch(() => {})

  return NextResponse.json({
    message: "Account created. Please verify your email before logging in.",
    ...(process.env.NODE_ENV !== "production" && { verificationLink: link }),
  })
}
