import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      image: body.image || null,
      description: body.description || null,
      sortOrder: Number(body.sortOrder ?? 0),
    },
  })
  return NextResponse.json({ category })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
