import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { verifyPassword, createCustomerToken, CUSTOMER_COOKIE, normalizeEmail } from "@/lib/customer-auth"
import { isSupabaseConfigured, supabasePasswordLogin } from "@/lib/supabase-auth"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`customer-login:${requestIp(req)}`, 12)) {
    return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 })
  }
  const body = await req.json()
  const email = normalizeEmail(body.email ?? "")
  const password = String(body.password ?? "")
  const remember = Boolean(body.remember)
  const method = body.method

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
      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
        path: "/",
      } as const
      cookieStore.set(CUSTOMER_COOKIE, token, options)
      cookieStore.set("customer_token", token, options)
      return NextResponse.json({ user: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName } })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Login failed" }, { status: 401 })
    }
  }

  const customer = await prisma.customer.findUnique({ where: { email } })
  // Generic message for both unknown-email and wrong-password to avoid revealing
  // which emails have accounts (account enumeration).
  if (!customer) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }
  if (!customer.verified) {
    return NextResponse.json(
      { error: "Please verify your email to continue.", needsVerification: true },
      { status: 403 },
    )
  }

  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 })
  }

  const valid = await verifyPassword(password, customer.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
  }

  const token = createCustomerToken({
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
  })

  const cookieStore = await cookies()
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8,
    path: "/",
  } as const
  cookieStore.set(CUSTOMER_COOKIE, token, options)
  cookieStore.set("customer_token", token, options)

  return NextResponse.json({ user: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName } })
}
