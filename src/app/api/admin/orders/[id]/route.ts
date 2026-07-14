import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isOrderStatus, updateOrderStatus } from "@/lib/order-status"
import { isValidPlainText, isValidSafeId } from "@/lib/validation"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "orders:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid order id" }, { status: 400 })
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "orders:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  if (!isValidSafeId(id)) return NextResponse.json({ error: "Invalid order id" }, { status: 400 })
  const data = await req.json().catch(() => ({})) as { status?: string; note?: string }
  if (typeof data.status !== "string" || !isOrderStatus(data.status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 })
  }
  const order = await updateOrderStatus({
    orderId: id,
    status: data.status,
    changedBy: session.email,
    note: typeof data.note === "string" && isValidPlainText(data.note, { max: 500 }) ? data.note.trim().slice(0, 500) : null,
  })
  return NextResponse.json({ order })
}
