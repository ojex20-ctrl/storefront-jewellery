import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { normalizeProductInput } from "@/lib/product-input"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  try {
    const { id } = await params
    const data = await req.json()

    // Whitelist + normalize. Partial mode only touches fields that are present,
    // so Live/Draft toggles ({ published: true }) don't blank out media/classification.
    const rest = normalizeProductInput(data, { partial: true })

    const product = await prisma.product.update({ where: { id }, data: rest })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
