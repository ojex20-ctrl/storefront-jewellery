import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isValidSlug, normalizeSlug } from "@/lib/validation"

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
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { ids } = await req.json().catch(() => ({})) as { ids?: string[] }
  if (!Array.isArray(ids) || ids.length > 200) return NextResponse.json({ error: "Invalid wishlist payload" }, { status: 400 })
  const requested = Array.from(new Set(ids.map(normalizeSlug).filter(isValidSlug)))
  const products = requested.length > 0 ? await prisma.product.findMany({ where: { slug: { in: requested }, published: true }, select: { slug: true } }) : []
  const clean = products.map((product) => product.slug)
  await prisma.wishlist.deleteMany({ where: { customerId: session.id } })
  if (clean.length > 0) {
    await prisma.wishlist.createMany({
      data: clean.map((productId) => ({ customerId: session.id, productId })),
    })
  }
  return NextResponse.json({ ids: clean })
}
