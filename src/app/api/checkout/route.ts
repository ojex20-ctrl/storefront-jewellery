import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession, sanitizeName, sanitizePhone, normalizeEmail } from "@/lib/customer-auth"
import { isNonNegativeMoney, isValidEmail, isValidName, isValidPhone, isValidPlainText, isValidPostalCode } from "@/lib/validation"

type CheckoutItem = { name?: string; productId?: string; size?: string; qty?: number; price?: number; image?: string }
const PAYMENT_METHODS = new Set(["razorpay", "stripe"])

function validItem(item: CheckoutItem) {
  if (!item || typeof item !== "object") return false
  const qty = Number(item.qty ?? 1)
  const price = Number(item.price ?? 0)
  return Boolean(
    item.productId &&
    typeof item.productId === "string" &&
    item.productId.length <= 160 &&
    item.name &&
    typeof item.name === "string" &&
    item.name.trim().length <= 160 &&
    Number.isInteger(qty) && qty >= 1 && qty <= 99 &&
    Number.isInteger(price) && price >= 0 && price <= 100_000_000,
  )
}

export async function POST(req: Request) {
  const session = await verifyCustomerSession().catch(() => null)
  const body = await req.json().catch(() => ({}))
  const {
    email, phone, firstName, lastName, address, city, state, pincode, country,
    items, subtotal, shippingCost, total, payment, giftWrap, giftMessage, couponCode,
  } = body as { email?: string; phone?: string; firstName?: string; lastName?: string; address?: string; city?: string; state?: string; pincode?: string; country?: string; items?: CheckoutItem[]; subtotal?: number; shippingCost?: number; total?: number; payment?: string; giftWrap?: boolean; giftMessage?: string; couponCode?: string }

  const cleanEmail = normalizeEmail(email ?? "")
  const cleanPhone = sanitizePhone(phone ?? "")
  const cleanFirstName = sanitizeName(firstName ?? "")
  const cleanLastName = sanitizeName(lastName ?? "")
  const cleanAddress = String(address ?? "").trim().slice(0, 180)
  const cleanCity = String(city ?? "").trim().slice(0, 80)
  const cleanState = String(state ?? "").trim().slice(0, 80)
  const cleanPincode = String(pincode ?? "").trim().slice(0, 16)
  const cleanCountry = String(country ?? "India").trim().slice(0, 80) || "India"
  const paymentMethod = PAYMENT_METHODS.has(String(payment)) ? String(payment) : "razorpay"

  if (!isValidEmail(cleanEmail)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 })
  if (!isValidPhone(cleanPhone, { required: true })) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })
  if (!isValidName(cleanFirstName, { required: true })) return NextResponse.json({ error: "First name is required." }, { status: 400 })
  if (!isValidName(cleanLastName)) return NextResponse.json({ error: "Enter a valid last name." }, { status: 400 })
  if (!isValidPlainText(cleanAddress, { required: true, min: 5, max: 180 })) return NextResponse.json({ error: "Enter a complete shipping address." }, { status: 400 })
  if (!isValidPlainText(cleanCity, { required: true, min: 2, max: 80 })) return NextResponse.json({ error: "Enter a valid city." }, { status: 400 })
  if (!isValidPostalCode(cleanPincode, { required: true })) return NextResponse.json({ error: "Enter a valid pincode." }, { status: 400 })
  if (!Array.isArray(items) || items.length === 0 || items.length > 50 || !items.every(validItem)) {
    return NextResponse.json({ error: "Cart contains invalid items. Please refresh and try again." }, { status: 400 })
  }

  const serverSubtotal = items.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.qty ?? 1), 0)
  const serverShipping = Number(shippingCost ?? 0)
  if (!isNonNegativeMoney(serverShipping)) return NextResponse.json({ error: "Invalid shipping amount." }, { status: 400 })

  let serverDiscount = 0
  let validCoupon: { code: string } | null = null
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: String(couponCode).toUpperCase().trim() } })
    const usable = coupon && coupon.active && (!coupon.expiresAt || new Date() <= coupon.expiresAt) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses) && (!coupon.minOrder || serverSubtotal >= coupon.minOrder)
    if (usable && coupon) {
      serverDiscount = coupon.type === "percentage" ? Math.round((serverSubtotal * coupon.value) / 100) : coupon.value
      serverDiscount = Math.min(serverDiscount, serverSubtotal)
      validCoupon = { code: coupon.code }
    }
  }
  const serverTotal = Math.max(0, serverSubtotal + serverShipping - serverDiscount)
  if (Number(subtotal ?? 0) !== serverSubtotal || Number(total ?? 0) !== serverTotal) {
    return NextResponse.json({ error: "Cart total changed. Please refresh checkout." }, { status: 400 })
  }

  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } })
  const orderNumber = (lastOrder?.orderNumber ?? 1000) + 1
  const safeItems = items.map((item) => ({ name: String(item.name ?? "").trim().slice(0, 160), productId: String(item.productId ?? "").trim().slice(0, 160), size: item.size ? String(item.size).trim().slice(0, 80) : "", qty: Number(item.qty ?? 1), price: Number(item.price ?? 0), image: item.image ? String(item.image).trim().slice(0, 500) : "" }))

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: session?.id ?? null,
      email: cleanEmail,
      phone: cleanPhone,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      address: cleanAddress,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      country: cleanCountry,
      items: JSON.stringify(safeItems),
      subtotal: serverSubtotal,
      shippingCost: serverShipping,
      discount: serverDiscount,
      total: serverTotal,
      paymentMethod,
      paymentStatus: "pending",
      status: "placed",
      giftWrap: giftWrap ?? false,
      giftMessage: giftMessage ? String(giftMessage).trim().slice(0, 500) : null,
      couponCode: validCoupon?.code ?? null,
    },
  })

  if (session) {
    const c = await prisma.customer.findUnique({ where: { id: session.id } }).catch(() => null)
    if (c) {
      const patch: Record<string, string> = {}
      if (!c.firstName && cleanFirstName) patch.firstName = cleanFirstName
      if (!c.lastName && cleanLastName) patch.lastName = cleanLastName
      if (!c.phone && cleanPhone) patch.phone = cleanPhone
      if (Object.keys(patch).length > 0) await prisma.customer.update({ where: { id: session.id }, data: patch }).catch(() => null)
    }
  }

  return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber } }, { status: 201 })
}
