import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isOrderStatus, updateOrderStatus } from "@/lib/order-status"

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
  if (!hasPermission(session, "orders:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const data = await req.json()
  if (typeof data.status !== "string" || !isOrderStatus(data.status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 })
  }
  const order = await updateOrderStatus({
    orderId: id,
    status: data.status,
    changedBy: session.email,
    note: typeof data.note === "string" ? data.note : null,
  })
  return NextResponse.json({ order })
}
