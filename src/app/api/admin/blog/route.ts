import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ posts })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  if (!data.slug) data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  if (Array.isArray(data.tags)) data.tags = JSON.stringify(data.tags)
  const post = await prisma.blogPost.create({ data })
  return NextResponse.json({ post }, { status: 201 })
}
