import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword, isStrongPassword, verifyCustomerSession, verifyPassword } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword) return NextResponse.json({ error: "Both passwords are required." }, { status: 400 })
  if (!isStrongPassword(newPassword)) {
    return NextResponse.json({ error: "Password must be 8+ characters with uppercase, lowercase, and a number." }, { status: 400 })
  }

  const customer = await prisma.customer.findUnique({ where: { id: session.id } })
  if (!customer || customer.passwordHash === "supabase") return NextResponse.json({ error: "Password cannot be changed here." }, { status: 400 })
  const valid = await verifyPassword(currentPassword, customer.passwordHash)
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 })

  await prisma.customer.update({ where: { id: session.id }, data: { passwordHash: await hashPassword(newPassword) } })
  return NextResponse.json({ message: "Password updated." })
}
