import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendAdminNewOrderAlert, sendOrderPlacedEmail } from "@/lib/email"
import { verifyCustomerSession, sanitizeName, sanitizePhone } from "@/lib/customer-auth"

type CheckoutItem = {
  name?: string
  productId?: string
  size?: string
  qty?: number
  price?: number
  image?: string
}

export async function POST(req: Request) {
  const session = await verifyCustomerSession().catch(() => null)
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

  // Recompute the discount from the coupon server-side — never trust the client value.
  let serverDiscount = 0
  let validCoupon: { id: string; code: string } | null = null
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: String(couponCode).toUpperCase() } })
    const usable =
      coupon &&
      coupon.active &&
      (!coupon.expiresAt || new Date() <= coupon.expiresAt) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrder || serverSubtotal >= coupon.minOrder)
    if (usable && coupon) {
      serverDiscount =
        coupon.type === "percentage" ? Math.round((serverSubtotal * coupon.value) / 100) : coupon.value
      serverDiscount = Math.min(serverDiscount, serverSubtotal)
      validCoupon = { id: coupon.id, code: coupon.code }
    }
  }
  const serverTotal = Math.max(0, serverSubtotal + serverShipping - serverDiscount)

  if (Number(subtotal ?? 0) !== serverSubtotal || Number(total ?? 0) !== serverTotal) {
    return NextResponse.json({ error: "Cart total changed. Please refresh checkout." }, { status: 400 })
  }

  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } })
  const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: session?.id ?? null,
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
      couponCode: validCoupon?.code ?? null,
    },
  })

  if (validCoupon) {
    await prisma.coupon.update({ where: { id: validCoupon.id }, data: { usedCount: { increment: 1 } } }).catch(() => null)
  }

  // Enrich the logged-in customer's profile with any details we just captured
  // at checkout that were missing on their account (name / phone).
  if (session) {
    const c = await prisma.customer.findUnique({ where: { id: session.id } }).catch(() => null)
    if (c) {
      const patch: Record<string, string> = {}
      if (!c.firstName && firstName) patch.firstName = sanitizeName(firstName)
      if (!c.lastName && lastName) patch.lastName = sanitizeName(lastName)
      if (!c.phone && phone) patch.phone = sanitizePhone(phone)
      if (Object.keys(patch).length > 0) {
        await prisma.customer.update({ where: { id: session.id }, data: patch }).catch(() => null)
      }
    }
  }

  await Promise.all([
    sendOrderPlacedEmail(order).catch(() => false),
    sendAdminNewOrderAlert(order).catch(() => false),
  ])

  return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber } }, { status: 201 })
}
