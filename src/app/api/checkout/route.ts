import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendAdminNewOrderAlert, sendOrderPlacedEmail } from "@/lib/email"

type CheckoutItem = {
  name?: string
  productId?: string
  size?: string
  qty?: number
  price?: number
  image?: string
}

export async function POST(req: Request) {
  const body = await req.json()
  const {
    email,
    phone,
    firstName,
    lastName,
    address,
    city,
    state,
    pincode,
    country,
    items,
    subtotal,
    shippingCost,
    discount,
    total,
    payment,
    giftWrap,
    giftMessage,
    couponCode,
  } = body as {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
    items?: CheckoutItem[]
    subtotal?: number
    shippingCost?: number
    discount?: number
    total?: number
    payment?: string
    giftWrap?: boolean
    giftMessage?: string
    couponCode?: string
  }

  if (!email || !firstName || !address || !city || !pincode || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const serverSubtotal = items.reduce((sum, item) => {
    return sum + Number(item.price ?? 0) * Number(item.qty ?? 1)
  }, 0)
  const serverShipping = Number(shippingCost ?? 0)
  const serverDiscount = Number(discount ?? 0)
  const serverTotal = Math.max(0, serverSubtotal + serverShipping - serverDiscount)

  if (Number(subtotal ?? 0) !== serverSubtotal || Number(total ?? 0) !== serverTotal) {
    return NextResponse.json({ error: "Cart total changed. Please refresh checkout." }, { status: 400 })
  }

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
      subtotal: serverSubtotal,
      shippingCost: serverShipping,
      discount: serverDiscount,
      total: serverTotal,
      paymentMethod: payment ?? "razorpay",
      paymentStatus: "pending",
      status: "placed",
      giftWrap: giftWrap ?? false,
      giftMessage: giftMessage ?? null,
      couponCode: couponCode ?? null,
    },
  })

  await Promise.all([
    sendOrderPlacedEmail(order).catch(() => false),
    sendAdminNewOrderAlert(order).catch(() => false),
  ])

  return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber } }, { status: 201 })
}
