import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const { orderNumber, identity } = await req.json() as { orderNumber?: string; identity?: string }
  const parsedOrderNumber = Number(String(orderNumber ?? "").replace(/[^\d]/g, ""))
  const normalizedIdentity = String(identity ?? "").trim().toLowerCase()

  if (!parsedOrderNumber || !normalizedIdentity) {
    return NextResponse.json({ error: "Order number and email or phone are required" }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: parsedOrderNumber } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const emailMatches = order.email.toLowerCase() === normalizedIdentity
  const phoneMatches = order.phone.replace(/[^\d]/g, "").endsWith(normalizedIdentity.replace(/[^\d]/g, ""))
  if (!emailMatches && !phoneMatches) {
    return NextResponse.json({ error: "Order details do not match" }, { status: 404 })
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items,
    },
  })
}
