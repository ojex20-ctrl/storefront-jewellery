import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

type WishlistRow = { productId: string }

export async function GET() {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Wishlist" ("id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "productId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  const rows = await prisma.$queryRawUnsafe<WishlistRow[]>(`SELECT "productId" FROM "Wishlist" WHERE "customerId" = ? ORDER BY "createdAt" DESC`, session.id)
  return NextResponse.json({ ids: rows.map((row) => row.productId) })
}

export async function PUT(req: Request) {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { ids } = await req.json() as { ids: string[] }
  const clean = Array.from(new Set((ids ?? []).filter((id) => typeof id === "string")))
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Wishlist" ("id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "productId" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await prisma.$executeRawUnsafe(`DELETE FROM "Wishlist" WHERE "customerId" = ?`, session.id)
  for (const productId of clean) {
    await prisma.$executeRawUnsafe(`INSERT INTO "Wishlist" ("id", "customerId", "productId") VALUES (?, ?, ?)`, crypto.randomUUID(), session.id, productId)
  }
  return NextResponse.json({ ids: clean })
}
