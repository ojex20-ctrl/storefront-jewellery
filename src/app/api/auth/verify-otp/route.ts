import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { verifyOtp, createCustomerToken, CUSTOMER_COOKIE, normalizeEmail } from "@/lib/customer-auth"

export async function POST(req: Request) {
  const { email: rawEmail, code, type } = await req.json()
  const email = normalizeEmail(rawEmail ?? "")

  if (!email || !code) {
    return NextResponse.json({ error: "Email and OTP code required" }, { status: 400 })
  }

  const valid = await verifyOtp(email, code, type ?? "register")
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
  }

  // Mark customer as verified
  const customer = await prisma.customer.update({
    where: { email },
    data: { verified: true }
  })

  // Auto-login after verification
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
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  } as const
  cookieStore.set(CUSTOMER_COOKIE, token, options)
  cookieStore.set("customer_token", token, options)

  return NextResponse.json({ user: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName } })
}
