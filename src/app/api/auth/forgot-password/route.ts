import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createOtp } from "@/lib/customer-auth"

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer) {
    // Don't reveal if email exists
    return NextResponse.json({ message: "If the email exists, an OTP has been sent." })
  }

  const { code } = await createOtp(email, "reset")

  return NextResponse.json({
    message: "OTP sent to your email",
    otp: process.env.NODE_ENV === "production" ? undefined : code,
  })
}
