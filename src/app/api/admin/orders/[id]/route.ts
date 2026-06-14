import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const order = await prisma.order.update({ where: { id }, data })
  return NextResponse.json({ order })
}
