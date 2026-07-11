import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, hashToken, isStrongPassword } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const { token, newPassword } = await req.json()

  if (!token || !newPassword) {
    return NextResponse.json({ error: "Reset token and new password required" }, { status: 400 })
  }
  if (!isStrongPassword(newPassword)) {
    return NextResponse.json({ error: "Password must be 8+ characters with uppercase, lowercase, and a number." }, { status: 400 })
  }

  const reset = await prisma.passwordResetToken
    .findUnique({ where: { tokenHash: hashToken(token) } })
    .catch(() => null)
  if (!reset || reset.usedAt || new Date(reset.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Reset link expired or invalid." }, { status: 401 })
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.customer.update({ where: { id: reset.customerId }, data: { passwordHash } })
  await prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } })

  return NextResponse.json({ message: "Password reset successfully" })
}
