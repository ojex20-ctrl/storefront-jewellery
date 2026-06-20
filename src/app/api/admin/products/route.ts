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

  try {
    const body = await req.json()
    const isArray = Array.isArray(body)
    const items = isArray ? body : [body]

    const cleanItems = []
    for (const item of items) {
      const data = { ...item }
      if (!data.name) {
        return NextResponse.json({ error: "Product name is required" }, { status: 400 })
      }
      // Auto-generate slug if not provided
      if (!data.slug) {
        data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }
      // Ensure JSON fields are strings
      for (const field of ["metals", "stones", "sizes", "gallery", "modelImages", "bundleIds"]) {
        if (Array.isArray(data[field])) {
          data[field] = JSON.stringify(data[field])
        } else if (data[field] === undefined) {
          data[field] = "[]"
        }
      }

      // Strip virtual fields and database-generated id to prevent prisma validation crash
      const { vibe, id, ...rest } = data
      cleanItems.push(rest)
    }

    // Database insertion wrapped in a transaction for all-or-nothing safety
    const results = await prisma.$transaction(
      cleanItems.map((data) => prisma.product.create({ data }))
    )

    if (isArray) {
      return NextResponse.json({ products: results }, { status: 201 })
    } else {
      return NextResponse.json({ product: results[0] }, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product(s)" },
      { status: 500 }
    )
  }
}
