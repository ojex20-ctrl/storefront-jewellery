import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, hashToken, hasLocalPasswordHash, isStrongPassword } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"
import { sendEmail, passwordChangedEmail } from "@/lib/email"

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

  const existingCustomer = await prisma.customer.findUnique({ where: { id: reset.customerId }, select: { id: true, passwordHash: true } })
  if (!existingCustomer || !hasLocalPasswordHash(existingCustomer.passwordHash)) {
    await prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } })
    return NextResponse.json({ error: "Password reset is not available for this account." }, { status: 400 })
  }

  const passwordHash = await hashPassword(newPassword)
  const customer = await prisma.customer.update({ where: { id: reset.customerId }, data: { passwordHash } })
  await prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } })

  const { subject, html } = passwordChangedEmail(customer.firstName)
  await sendEmail({ to: customer.email, subject, html }).catch(() => {})

  return NextResponse.json({ message: "Password reset successfully" })
}
