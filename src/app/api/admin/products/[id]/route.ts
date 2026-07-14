import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isValidSafeId, normalizeSlug } from "@/lib/validation"
import { normalizeProductInput, validateProductInput } from "@/lib/product-input"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { id } = await params
    if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
    const data = await req.json().catch(() => null)
    if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Invalid product payload." }, { status: 400 })
    const productData = data as Record<string, unknown>
    if (productData.slug) productData.slug = normalizeSlug(productData.slug)
    const error = validateProductInput(productData, { partial: true })
    if (error) return NextResponse.json({ error }, { status: 400 })

    // Whitelist + normalize. Partial mode only touches fields that are present,
    // so Live/Draft toggles ({ published: true }) don't blank out media/classification.
    const rest = normalizeProductInput(productData, { partial: true })

    const product = await prisma.product.update({ where: { id }, data: rest })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 400 }
    )
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
