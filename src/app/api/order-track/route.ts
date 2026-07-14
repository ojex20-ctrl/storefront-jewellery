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
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discount: order.discount,
      total: order.total,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      items: parseItems(order.items),
    },
  })
}

function parseItems(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Array<{
      productId?: string
      name?: string
      category?: string
      image?: string
      size?: string
      price?: number
      qty?: number
    }>
    return parsed.map((item, index) => ({
      id: item.productId ?? `item-${index}`,
      name: item.name ?? "SYRA item",
      category: item.category ?? "",
      image: item.image ?? "",
      size: item.size ?? "",
      price: item.price ?? 0,
      qty: item.qty ?? 1,
    }))
  } catch {
    return []
  }
}
