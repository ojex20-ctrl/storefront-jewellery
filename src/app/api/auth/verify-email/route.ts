import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashToken } from "@/lib/customer-auth"

type VerificationRow = { id: string; customerId: string; expiresAt: Date | string; usedAt: Date | string | null }

export async function POST(req: Request) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: "Verification token required" }, { status: 400 })

  const rows = await prisma.$queryRawUnsafe<VerificationRow[]>(
    `SELECT "id", "customerId", "expiresAt", "usedAt" FROM "EmailVerificationToken" WHERE "tokenHash" = ? LIMIT 1`,
    hashToken(token),
  ).catch(() => [])
  const row = rows[0]
  if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Verification link expired or invalid." }, { status: 401 })
  }

  await prisma.customer.update({ where: { id: row.customerId }, data: { verified: true } })
  await prisma.$executeRawUnsafe(`UPDATE "EmailVerificationToken" SET "usedAt" = ? WHERE "id" = ?`, new Date(), row.id)

  return NextResponse.json({ message: "Email verified. You can now log in." })
}
