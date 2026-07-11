import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashToken } from "@/lib/customer-auth"

export async function POST(req: Request) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: "Verification token required" }, { status: 400 })

  const row = await prisma.emailVerificationToken
    .findUnique({ where: { tokenHash: hashToken(token) } })
    .catch(() => null)
  if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Verification link expired or invalid." }, { status: 401 })
  }

  await prisma.customer.update({ where: { id: row.customerId }, data: { verified: true } })
  await prisma.emailVerificationToken.update({ where: { id: row.id }, data: { usedAt: new Date() } })

  return NextResponse.json({ message: "Email verified. You can now log in." })
}
