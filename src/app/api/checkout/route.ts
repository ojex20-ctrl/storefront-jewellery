import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json()
  const { email, phone, firstName, lastName, address, city, state, pincode, country, items, subtotal, shippingCost, discount, total, payment, giftWrap, giftMessage, couponCode } = body

  if (!email || !firstName || !address || !city || !pincode || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Generate order number
  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } })
  const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1

  const order = await prisma.order.create({
    data: {
      orderNumber,
      email,
      phone: phone ?? "",
      firstName,
      lastName: lastName ?? "",
      address,
      city,
      state: state ?? "",
      pincode,
      country: country ?? "India",
      items: JSON.stringify(items),
      subtotal: subtotal ?? 0,
      shippingCost: shippingCost ?? 0,
      discount: discount ?? 0,
      total: total ?? 0,
      paymentMethod: payment ?? "razorpay",
      paymentStatus: "paid", // Mock — in production, set after webhook confirmation
      status: "confirmed",
      giftWrap: giftWrap ?? false,
      giftMessage: giftMessage ?? null,
      couponCode: couponCode ?? null,
    },
  })

  return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber } }, { status: 201 })
}
