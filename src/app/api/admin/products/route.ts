import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"

export async function GET(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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

      // 1. Images
      const imagesArr = Array.isArray(data.images) ? data.images : (data.image ? [data.image] : [])
      data.images = JSON.stringify(imagesArr)
      data.image = imagesArr[0] || ""
      data.gallery = JSON.stringify(imagesArr)

      // 2. Kinds
      const kindsArr = Array.isArray(data.kinds) ? data.kinds : (data.kind ? [data.kind] : [])
      data.kinds = JSON.stringify(kindsArr)
      data.kind = kindsArr[0] || "Ring"

      // 3. Main Hierarchies
      const mainArr = Array.isArray(data.mainHierarchies) ? data.mainHierarchies : (data.mainHierarchy ? [data.mainHierarchy] : [])
      data.mainHierarchies = JSON.stringify(mainArr)
      data.mainHierarchy = mainArr[0] || null

      // 4. Sub Hierarchies
      const subArr = Array.isArray(data.subHierarchies) ? data.subHierarchies : (data.subHierarchy ? [data.subHierarchy] : [])
      data.subHierarchies = JSON.stringify(subArr)
      data.subHierarchy = subArr[0] || null

      // 5. Ring Type
      const ringTypeArr = Array.isArray(data.ringType) ? data.ringType : []
      data.ringType = JSON.stringify(ringTypeArr)

      // 6. Tags
      const tagsArr = Array.isArray(data.tags) ? data.tags : (data.tag ? [data.tag] : [])
      data.tags = JSON.stringify(tagsArr)
      data.tag = tagsArr[0] || null

      // Ensure JSON fields are strings
      for (const field of ["metals", "stones", "sizes", "modelImages", "bundleIds"]) {
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
