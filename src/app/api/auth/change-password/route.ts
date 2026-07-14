import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, hasLocalPasswordHash, isStrongPassword, verifyCustomerSession, verifyPassword } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"
import { sendEmail, passwordChangedEmail } from "@/lib/email"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { currentPassword?: string; newPassword?: string }
  const currentPassword = String(body.currentPassword ?? "")
  const newPassword = String(body.newPassword ?? "")
  if (!currentPassword || !newPassword) return NextResponse.json({ error: "Both passwords are required." }, { status: 400 })
  if (!isStrongPassword(newPassword)) {
    return NextResponse.json({ error: "Password must be 8+ characters with uppercase, lowercase, and a number." }, { status: 400 })
  }

  const customer = await prisma.customer.findUnique({ where: { id: session.id } })
  if (!customer || !hasLocalPasswordHash(customer.passwordHash)) return NextResponse.json({ error: "Password cannot be changed for this sign-in method." }, { status: 400 })
  const valid = await verifyPassword(currentPassword, customer.passwordHash)
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 })

  await prisma.customer.update({ where: { id: session.id }, data: { passwordHash: await hashPassword(newPassword) } })

  const { subject, html } = passwordChangedEmail(customer.firstName)
  await sendEmail({ to: customer.email, subject, html }).catch(() => {})

  return NextResponse.json({ message: "Password updated." })
}
