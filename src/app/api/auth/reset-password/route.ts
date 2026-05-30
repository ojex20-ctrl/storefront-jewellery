import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyOtp, hashPassword } from "@/lib/customer-auth"

export async function POST(req: Request) {
  const { email, code, newPassword } = await req.json()

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "Email, OTP, and new password required" }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  const valid = await verifyOtp(email, code, "reset")
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.customer.update({ where: { email }, data: { passwordHash } })

  return NextResponse.json({ message: "Password reset successfully" })
}
