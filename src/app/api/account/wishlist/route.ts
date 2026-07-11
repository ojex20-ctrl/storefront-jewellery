import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

export async function GET() {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await prisma.wishlist.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    select: { productId: true },
  })
  return NextResponse.json({ ids: rows.map((row) => row.productId) })
}

export async function PUT(req: Request) {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { ids } = await req.json() as { ids: string[] }
  const clean = Array.from(new Set((ids ?? []).filter((id) => typeof id === "string")))
  await prisma.wishlist.deleteMany({ where: { customerId: session.id } })
  if (clean.length > 0) {
    await prisma.wishlist.createMany({
      data: clean.map((productId) => ({ customerId: session.id, productId })),
    })
  }
  return NextResponse.json({ ids: clean })
}
