import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

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

    // Preserve existing media/classification fields on partial updates like Live/Draft toggles.
    if ("images" in data || "image" in data) {
      const imagesArr = Array.isArray(data.images) ? data.images : (data.image ? [data.image] : [])
      data.images = JSON.stringify(imagesArr)
      data.image = imagesArr[0] || ""
      data.gallery = JSON.stringify(imagesArr)
    }

    if ("kinds" in data || "kind" in data) {
      const kindsArr = Array.isArray(data.kinds) ? data.kinds : (data.kind ? [data.kind] : [])
      data.kinds = JSON.stringify(kindsArr)
      data.kind = kindsArr[0] || "Ring"
    }

    if ("mainHierarchies" in data || "mainHierarchy" in data) {
      const mainArr = Array.isArray(data.mainHierarchies) ? data.mainHierarchies : (data.mainHierarchy ? [data.mainHierarchy] : [])
      data.mainHierarchies = JSON.stringify(mainArr)
      data.mainHierarchy = mainArr[0] || null
    }

    if ("subHierarchies" in data || "subHierarchy" in data) {
      const subArr = Array.isArray(data.subHierarchies) ? data.subHierarchies : (data.subHierarchy ? [data.subHierarchy] : [])
      data.subHierarchies = JSON.stringify(subArr)
      data.subHierarchy = subArr[0] || null
    }

    if ("ringType" in data) {
      const ringTypeArr = Array.isArray(data.ringType) ? data.ringType : []
      data.ringType = JSON.stringify(ringTypeArr)
    }

    if ("tags" in data || "tag" in data) {
      const tagsArr = Array.isArray(data.tags) ? data.tags : (data.tag ? [data.tag] : [])
      data.tags = JSON.stringify(tagsArr)
      data.tag = tagsArr[0] || null
    }

    // Ensure JSON fields are strings
    for (const field of ["metals", "stones", "sizes", "modelImages", "bundleIds"]) {
      if (Array.isArray(data[field])) {
        data[field] = JSON.stringify(data[field])
      } else if (field in data && data[field] === undefined) {
        data[field] = "[]"
      }
    }

    // Strip virtual fields and database-generated id to prevent prisma validation crash
    const { vibe, id: _, ...rest } = data

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
