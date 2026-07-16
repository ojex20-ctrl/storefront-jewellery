import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { getBrandConfig } from "@/lib/brand-config"
import { verifyCustomerSession, sanitizeName, sanitizePhone, normalizeEmail } from "@/lib/customer-auth"
import { isNonNegativeMoney, isValidCouponCode, isValidEmail, isValidName, isValidPhone, isValidPlainText, isValidPostalCode, normalizeCouponCode } from "@/lib/validation"

type CheckoutItem = { name?: string; productId?: string; size?: string; qty?: number; price?: number; image?: string }
const PAYMENT_METHODS = new Set(["razorpay", "stripe"])
const SHIPPING_METHODS = new Set(["standard", "express", "pickup"])
type ShippingMethod = "standard" | "express" | "pickup"
type CouponReservation = { couponCode: string; discount: number; reserved: true } | { error: string }

function validItem(item: CheckoutItem) {
  if (!item || typeof item !== "object") return false
  const qty = Number(item.qty ?? 1)
  return Boolean(
    item.productId &&
    typeof item.productId === "string" &&
    item.productId.length <= 160 &&
    /^[A-Za-z0-9_-]+$/.test(item.productId) &&
    Number.isInteger(qty) && qty >= 1 && qty <= 99,
  )
}

function isDuplicateOrderNumberError(err: unknown) {
  if (!err || typeof err !== "object" || !("code" in err)) return false
  if ((err as { code?: unknown }).code !== "P2002") return false
  const target = (err as { meta?: { target?: unknown } }).meta?.target
  return Array.isArray(target) ? target.includes("orderNumber") : String(target ?? "").includes("orderNumber")
}

async function nextOrderNumber() {
  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" }, select: { orderNumber: true } })
  return (lastOrder?.orderNumber ?? 1000) + 1
}

async function createOrderWithRetry(data: Omit<Prisma.OrderCreateInput, "orderNumber">) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.order.create({ data: { ...data, orderNumber: await nextOrderNumber() } })
    } catch (err) {
      if (!isDuplicateOrderNumberError(err) || attempt === 4) throw err
    }
  }
  throw new Error("Could not allocate order number")
}

async function loadProducts(items: CheckoutItem[]) {
  const ids = Array.from(new Set(items.map((item) => String(item.productId))))
  const products = await prisma.product.findMany({
    where: {
      published: true,
      OR: [{ slug: { in: ids } }, { id: { in: ids } }],
    },
    select: { id: true, slug: true, name: true, price: true, image: true, images: true, gallery: true },
  })
  const byKey = new Map<string, (typeof products)[number]>()
  for (const product of products) {
    byKey.set(product.id, product)
    byKey.set(product.slug, product)
  }
  return byKey
}

function firstImage(product: { image: string; images: string; gallery: string }) {
  for (const raw of [product.images, product.gallery]) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0]) return parsed[0]
    } catch {
      // Keep falling back through the available image fields.
    }
  }
  return product.image || ""
}

function shippingCost(method: ShippingMethod, subtotal: number, brand: Awaited<ReturnType<typeof getBrandConfig>>) {
  if (method === "pickup") return 0
  if (method === "express") return brand.shipping_express_rate
  return subtotal >= brand.free_shipping_threshold ? 0 : brand.shipping_standard_rate
}

async function reserveCoupon(code: string, subtotal: number): Promise<CouponReservation> {
  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) return { error: "Invalid coupon code" }
  if (!coupon.active) return { error: "This coupon is no longer active" }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return { error: "This coupon has expired" }
  if (coupon.minOrder && subtotal < coupon.minOrder) return { error: `Minimum order of ₹${(coupon.minOrder / 100).toLocaleString()} required` }

  const discount = Math.min(coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value, subtotal)
  const reserve = await prisma.coupon.updateMany({
    where: {
      code,
      active: true,
      OR: [{ maxUses: null }, { usedCount: { lt: coupon.maxUses ?? 0 } }],
      ...(coupon.expiresAt ? { expiresAt: { gte: new Date() } } : {}),
      ...(coupon.minOrder ? { minOrder: { lte: subtotal } } : {}),
    },
    data: { usedCount: { increment: 1 } },
  })
  if (reserve.count === 0) return { error: "This coupon has reached its usage limit" }
  return { couponCode: coupon.code, discount, reserved: true }
}

async function releaseCoupon(code: string) {
  await prisma.coupon.updateMany({
    where: { code, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } },
  }).catch(() => null)
}

export async function POST(req: Request) {
  const session = await verifyCustomerSession().catch(() => null)
  const body = await req.json().catch(() => ({}))
  const {
    email, phone, firstName, lastName, address, city, state, pincode, country,
    items, subtotal, total, payment, giftWrap, giftMessage, couponCode, shipping,
  } = body as { email?: string; phone?: string; firstName?: string; lastName?: string; address?: string; city?: string; state?: string; pincode?: string; country?: string; items?: CheckoutItem[]; subtotal?: number; total?: number; payment?: string; giftWrap?: boolean; giftMessage?: string; couponCode?: string; shipping?: string }

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
  const shippingMethod = SHIPPING_METHODS.has(String(shipping)) ? String(shipping) as ShippingMethod : "standard"

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

  const products = await loadProducts(items)
  const safeItems = items.map((item) => {
    const product = products.get(String(item.productId))
    if (!product) return null
    if (!isNonNegativeMoney(product.price)) return null
    const qty = Number(item.qty ?? 1)
    return {
      name: product.name,
      productId: product.slug,
      size: item.size ? String(item.size).trim().slice(0, 80) : "",
      qty,
      price: product.price,
      image: firstImage(product),
    }
  })
  if (safeItems.some((item) => !item)) {
    return NextResponse.json({ error: "A product in your cart is no longer available. Please refresh and try again." }, { status: 400 })
  }

  const pricedItems = safeItems as Array<{ name: string; productId: string; size: string; qty: number; price: number; image: string }>
  const serverSubtotal = pricedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  if (!isNonNegativeMoney(serverSubtotal)) return NextResponse.json({ error: "Cart subtotal is invalid." }, { status: 400 })
  const brand = await getBrandConfig()
  const serverShipping = shippingCost(shippingMethod, serverSubtotal, brand)
  if (!isNonNegativeMoney(serverShipping)) return NextResponse.json({ error: "Invalid shipping amount." }, { status: 400 })

  let serverDiscount = 0
  let reservedCouponCode: string | null = null
  let couponUsageRecorded = false
  if (couponCode) {
    const code = normalizeCouponCode(couponCode)
    if (!isValidCouponCode(code)) return NextResponse.json({ error: "Enter a valid coupon code." }, { status: 400 })
    const reservation = await reserveCoupon(code, serverSubtotal)
    if ("error" in reservation) return NextResponse.json({ error: reservation.error }, { status: 400 })
    reservedCouponCode = reservation.couponCode
    serverDiscount = reservation.discount
    couponUsageRecorded = reservation.reserved
  }
  const serverTotal = Math.max(0, serverSubtotal + serverShipping - serverDiscount)
  if (Number(subtotal ?? 0) !== serverSubtotal || Number(total ?? 0) !== serverTotal) {
    if (reservedCouponCode) await releaseCoupon(reservedCouponCode)
    return NextResponse.json({ error: "Cart total changed. Please refresh checkout." }, { status: 400 })
  }

  let order: Awaited<ReturnType<typeof createOrderWithRetry>>
  try {
    order = await createOrderWithRetry({
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
      items: JSON.stringify(pricedItems),
      subtotal: serverSubtotal,
      shippingCost: serverShipping,
      discount: serverDiscount,
      total: serverTotal,
      paymentMethod,
      paymentStatus: "pending",
      status: "placed",
      giftWrap: giftWrap ?? false,
      giftMessage: giftMessage ? String(giftMessage).trim().slice(0, 500) : null,
      couponCode: reservedCouponCode,
      couponUsageRecorded,
    })
  } catch (err) {
    if (reservedCouponCode) await releaseCoupon(reservedCouponCode)
    throw err
  }

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
