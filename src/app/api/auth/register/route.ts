import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, createOtp } from "@/lib/customer-auth"
import { sendEmail, verificationEmail } from "@/lib/email"
import { isSupabaseConfigured, supabaseSignUp } from "@/lib/supabase-auth"

export async function POST(req: Request) {
  const { firstName, lastName, email, phone, password, confirmPassword } = await req.json()

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  if (isSupabaseConfigured()) {
    try {
      const auth = await supabaseSignUp({ email, password, firstName, lastName, phone })
      await prisma.customer.upsert({
        where: { email },
        update: { firstName, lastName, phone: phone ?? "", verified: false },
        create: { email, passwordHash: "supabase", firstName, lastName, phone: phone ?? "", verified: false },
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
  await prisma.customer.create({
    data: { email, passwordHash, firstName, lastName, phone: phone ?? "" }
  })

  // Generate OTP and send email
  const { code } = await createOtp(email, "register")
  const { subject, html } = verificationEmail(firstName, code)
  await sendEmail({ to: email, subject, html }).catch(() => {})

  return NextResponse.json({
    message: "Account created. Check your email for verification code.",
    // Return OTP in dev mode for testing
    ...(process.env.NODE_ENV !== "production" && { otp: code }),
  })
}
