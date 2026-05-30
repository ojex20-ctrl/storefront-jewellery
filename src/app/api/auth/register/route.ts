import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, createOtp } from "@/lib/customer-auth"

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

  const existing = await prisma.customer.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  await prisma.customer.create({
    data: { email, passwordHash, firstName, lastName, phone: phone ?? "" }
  })

  // Generate OTP for verification
  const { code } = await createOtp(email, "register")

  // In production, send this via email service (Resend/Brevo)
  // For dev/testing, we return it in the response
  return NextResponse.json({
    message: "Account created. Please verify with OTP.",
    otp: process.env.NODE_ENV === "production" ? undefined : code,
  })
}
