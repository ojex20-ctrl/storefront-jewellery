import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function GET(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const limit = parseInt(url.searchParams.get("limit") ?? "50")
  const search = url.searchParams.get("search") ?? ""

  const where = search ? { name: { contains: search } } : {}
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])
  return NextResponse.json({ products, total, page, limit })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  // Auto-generate slug if not provided
  if (!data.slug) {
    data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  }
  // Ensure JSON fields are strings
  for (const field of ["metals", "stones", "sizes", "gallery", "modelImages", "bundleIds"]) {
    if (Array.isArray(data[field])) data[field] = JSON.stringify(data[field])
  }
  const product = await prisma.product.create({ data })
  return NextResponse.json({ product }, { status: 201 })
}
