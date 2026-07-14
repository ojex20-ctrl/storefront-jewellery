import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isValidPlainText, isValidSafeId, isValidSlug, isValidUrlOrPath, normalizeSlug, toNonNegativeInt } from "@/lib/validation"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid category id" }, { status: 400 })
  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const name = String(body.name ?? "").trim().slice(0, 120)
  const slug = normalizeSlug(body.slug || name)
  const image = body.image ? String(body.image).trim().slice(0, 500) : null
  const description = body.description ? String(body.description).trim().slice(0, 500) : null
  if (!isValidPlainText(name, { required: true, max: 120 })) return NextResponse.json({ error: "Name required" }, { status: 400 })
  if (!isValidSlug(slug)) return NextResponse.json({ error: "Enter a valid slug" }, { status: 400 })
  if (image && !isValidUrlOrPath(image)) return NextResponse.json({ error: "Enter a valid image URL or path" }, { status: 400 })
  if (description && !isValidPlainText(description, { max: 500 })) return NextResponse.json({ error: "Enter a valid description" }, { status: 400 })
  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      image,
      description,
      sortOrder: toNonNegativeInt(body.sortOrder),
    },
  })
  return NextResponse.json({ category })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid category id" }, { status: 400 })
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
