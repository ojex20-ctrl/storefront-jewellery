import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  return NextResponse.json({ categories })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json()
  const name = String(body.name ?? "").trim()
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
  const slug = String(body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      image: body.image || null,
      description: body.description || null,
      sortOrder: Number(body.sortOrder ?? 0),
    },
  })
  return NextResponse.json({ category }, { status: 201 })
}
