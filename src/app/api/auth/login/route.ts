import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { verifyPassword, createCustomerToken, createOtp } from "@/lib/customer-auth"
import { sendEmail, loginOtpEmail } from "@/lib/email"
import { isSupabaseConfigured, supabasePasswordLogin } from "@/lib/supabase-auth"

export async function POST(req: Request) {
  const { email, password, method } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  if (isSupabaseConfigured() && method !== "otp") {
    if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 })
    try {
      const auth = await supabasePasswordLogin({ email, password })
      const meta = auth.user.user_metadata ?? {}
      const customer = await prisma.customer.upsert({
        where: { email: auth.user.email ?? email },
        update: {
          firstName: meta.first_name ?? "",
          lastName: meta.last_name ?? "",
          phone: meta.phone ?? "",
          verified: true,
        },
        create: {
          email: auth.user.email ?? email,
          passwordHash: "supabase",
          firstName: meta.first_name ?? "",
          lastName: meta.last_name ?? "",
          phone: meta.phone ?? "",
          verified: true,
        },
      })
      const token = createCustomerToken({
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      })
      const cookieStore = await cookies()
      cookieStore.set("customer_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      })
      return NextResponse.json({ user: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName } })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Login failed" }, { status: 401 })
    }
  }

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  // OTP-based login
  if (method === "otp") {
    const { code } = await createOtp(email, "login")
    const { subject, html } = loginOtpEmail(customer.firstName, code)
    await sendEmail({ to: email, subject, html }).catch(() => {})
    return NextResponse.json({
      message: "OTP sent to your email",
      ...(process.env.NODE_ENV !== "production" && { otp: code }),
    })
  }

  // Password-based login
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 })
  }

  const valid = await verifyPassword(password, customer.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const token = createCustomerToken({
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
  })

  const cookieStore = await cookies()
  cookieStore.set("customer_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })

  return NextResponse.json({ user: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName } })
}
