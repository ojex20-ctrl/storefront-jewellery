import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { verifyPassword, createCustomerToken, createOtp } from "@/lib/customer-auth"

export async function POST(req: Request) {
  const { email, password, method } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  // OTP-based login
  if (method === "otp") {
    const { code } = await createOtp(email, "login")
    return NextResponse.json({
      message: "OTP sent to your email",
      otp: process.env.NODE_ENV === "production" ? undefined : code,
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
