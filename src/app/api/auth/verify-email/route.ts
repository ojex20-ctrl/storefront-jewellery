import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashToken } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isValidToken } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const body = await req.json().catch(() => ({})) as { token?: string }
  const token = String(body.token ?? "").trim()
  if (!isValidToken(token)) return NextResponse.json({ error: "Verification token required" }, { status: 400 })

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
