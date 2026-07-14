import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isValidEmail, isValidPhone, normalizeEmailAddress, phoneDigits } from "@/lib/validation"

export async function POST(req: Request) {
  const { orderNumber, identity } = await req.json().catch(() => ({})) as { orderNumber?: string; identity?: string }
  const parsedOrderNumber = Number(String(orderNumber ?? "").replace(/[^\d]/g, ""))
  const normalizedIdentity = String(identity ?? "").trim().toLowerCase()
  const identityIsEmail = isValidEmail(normalizedIdentity)
  const identityIsPhone = isValidPhone(normalizedIdentity, { required: true })

  if (!Number.isInteger(parsedOrderNumber) || parsedOrderNumber <= 0 || !normalizedIdentity) {
    return NextResponse.json({ error: "Order number and email or phone are required" }, { status: 400 })
  }
  if (!identityIsEmail && !identityIsPhone) return NextResponse.json({ error: "Enter the email or phone used for the order." }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { orderNumber: parsedOrderNumber } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const emailMatches = identityIsEmail && order.email.toLowerCase() === normalizeEmailAddress(normalizedIdentity)
  const inputDigits = phoneDigits(normalizedIdentity)
  const storedDigits = phoneDigits(order.phone)
  const phoneMatches = identityIsPhone && inputDigits.length >= 8 && storedDigits.endsWith(inputDigits)
  if (!emailMatches && !phoneMatches) return NextResponse.json({ error: "Order details do not match" }, { status: 404 })

  return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod, subtotal: order.subtotal, shippingCost: order.shippingCost, discount: order.discount, total: order.total, createdAt: order.createdAt, trackingNumber: order.trackingNumber, trackingUrl: order.trackingUrl, items: parseItems(order.items) } })
}

function parseItems(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Array<{ productId?: string; name?: string; category?: string; image?: string; size?: string; price?: number; qty?: number }>
    return parsed.map((item, index) => ({ id: item.productId ?? `item-${index}`, name: item.name ?? "SYRA item", category: item.category ?? "", image: item.image ?? "", size: item.size ?? "", price: item.price ?? 0, qty: item.qty ?? 1 }))
  } catch { return [] }
}
