import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createRazorpayOrder, publicRazorpayKey, RAZORPAY_SETUP_MESSAGE } from "@/lib/razorpay-server"
import { getBrandConfig } from "@/lib/brand-config"
import { getPaymentSettings } from "@/lib/payment-settings"

export async function POST(req: Request) {
  const body = await req.json()
  const { orderId } = body as { orderId?: string }
  if (!orderId) return NextResponse.json({ error: "Order id is required" }, { status: 400 })

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (order.paymentStatus === "paid") return NextResponse.json({ error: "Order is already paid" }, { status: 409 })

  try {
    const [brand, payment] = await Promise.all([getBrandConfig(), getPaymentSettings()])
    const razorpayOrder = await createRazorpayOrder({
      amount: order.total,
      currency: payment.razorpay.currency,
      receipt: String(order.orderNumber),
      notes: { orderId: order.id, orderNumber: String(order.orderNumber) },
    })
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id, paymentMethod: "razorpay" },
    })

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: await publicRazorpayKey(),
      internalOrderId: order.id,
      brandName: brand.brand_name,
      themeColor: payment.razorpay.checkoutThemeColor,
      checkoutScriptUrl: payment.razorpay.checkoutScriptUrl,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : RAZORPAY_SETUP_MESSAGE
    return NextResponse.json({ error: message }, { status: message === RAZORPAY_SETUP_MESSAGE ? 503 : 502 })
  }
}
