import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { verifyOtp, createCustomerToken, CUSTOMER_COOKIE, normalizeEmail } from "@/lib/customer-auth"
import { sendEmail, welcomeEmail } from "@/lib/email"
import { isValidEmail, isValidOtp } from "@/lib/validation"

const OTP_TYPES = new Set(["register", "login", "reset"])

export async function POST(req: Request) {
  const { email: rawEmail, code, type } = await req.json().catch(() => ({}))
  const email = normalizeEmail(rawEmail ?? "")
  const otpType = OTP_TYPES.has(String(type)) ? String(type) : "register"
  const otpCode = String(code ?? "").trim()
  if (!isValidEmail(email) || !isValidOtp(otpCode)) return NextResponse.json({ error: "Enter a valid email and 6-digit OTP code." }, { status: 400 })

  const valid = await verifyOtp(email, otpCode, otpType)
  if (!valid) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })

  const customer = await prisma.customer.update({ where: { email }, data: { verified: true } }).catch(() => null)
  if (!customer) return NextResponse.json({ error: "Account not found." }, { status: 404 })
  if (otpType === "register") {
    const { subject, html } = welcomeEmail(customer.firstName)
    await sendEmail({ to: customer.email, subject, html }).catch(() => {})
  }

  const token = createCustomerToken({ id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName })
  const cookieStore = await cookies()
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" } as const
  cookieStore.set(CUSTOMER_COOKIE, token, options)
  cookieStore.set("customer_token", token, options)
  return NextResponse.json({ user: { id: customer.id, email: customer.email, firstName: customer.firstName, lastName: customer.lastName } })
}
