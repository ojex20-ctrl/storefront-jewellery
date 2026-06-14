import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function GET(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const page = url.searchParams.get("page") ?? "home"
  const sections = await prisma.siteContent.findMany({
    where: { page },
    orderBy: { sortOrder: "asc" },
  })
  return NextResponse.json({ sections })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await req.json()
  const section = await prisma.siteContent.create({ data })
  return NextResponse.json({ section }, { status: 201 })
}
