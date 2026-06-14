import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function GET(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const page = url.searchParams.get("page") ?? "home"
  const banners = await prisma.banner.findMany({
    where: { page },
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json({ banners })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const banner = await prisma.banner.create({ data })
  return NextResponse.json({ banner }, { status: 201 })
}
