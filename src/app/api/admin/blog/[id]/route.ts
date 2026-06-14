import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  if (Array.isArray(data.tags)) data.tags = JSON.stringify(data.tags)
  const post = await prisma.blogPost.update({ where: { id }, data })
  return NextResponse.json({ post })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await prisma.blogPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
