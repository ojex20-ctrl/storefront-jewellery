import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isValidPlainText, isValidSafeId } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const {
    internalOrderId,
    razorpay_payment_id,
    razorpay_order_id,
    code,
    source,
    step,
    reason,
    description,
  } = body as {
    internalOrderId?: string
    razorpay_payment_id?: string
    razorpay_order_id?: string
    code?: string
    source?: string
    step?: string
    reason?: string
    description?: string
  }

  if (!isValidSafeId(internalOrderId)) return NextResponse.json({ error: "Order id is required" }, { status: 400 })
  for (const field of [code, source, step, reason, description]) {
    if (field && !isValidPlainText(field, { max: 1000 })) return NextResponse.json({ error: "Invalid payment failure details" }, { status: 400 })
  }
  if (razorpay_payment_id && !isValidSafeId(razorpay_payment_id)) return NextResponse.json({ error: "Invalid payment id" }, { status: 400 })
  if (razorpay_order_id && !isValidSafeId(razorpay_order_id)) return NextResponse.json({ error: "Invalid Razorpay order id" }, { status: 400 })

  const existing = await prisma.order.findUnique({
    where: { id: internalOrderId },
    select: { id: true, orderNumber: true, paymentStatus: true },
  })
  if (!existing) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (existing.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, ignored: true, reason: "Order is already paid" })
  }

  const hasGatewayDetails = Boolean(razorpay_payment_id || razorpay_order_id || code || source || step || reason)
  if (existing.paymentStatus === "failed" && !hasGatewayDetails) {
    return NextResponse.json({ order: existing, ignored: true })
  }

  const order = await prisma.order.update({
    where: { id: internalOrderId },
    data: {
      paymentStatus: "failed",
      status: "placed",
      paymentMethod: "razorpay",
      paymentId: razorpay_payment_id ?? null,
      razorpayOrderId: razorpay_order_id ?? null,
      razorpayPaymentId: razorpay_payment_id ?? null,
      notes: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        failure: { code, source, step, reason, description },
        failed_at: new Date().toISOString(),
      }),
    },
    select: { id: true, orderNumber: true, paymentStatus: true },
  })

  return NextResponse.json({ order })
}
