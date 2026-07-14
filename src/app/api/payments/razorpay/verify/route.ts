import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay-server"
import { finalizePaidOrder } from "@/lib/payment-finalization"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isValidSafeId } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const {
    internalOrderId,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = body as {
    internalOrderId?: string
    razorpay_payment_id?: string
    razorpay_order_id?: string
    razorpay_signature?: string
  }

  if (!isValidSafeId(internalOrderId) || !isValidSafeId(razorpay_payment_id) || !isValidSafeId(razorpay_order_id) || !/^[A-Za-z0-9_-]{32,160}$/.test(String(razorpay_signature ?? ""))) {
    return NextResponse.json({ error: "Missing Razorpay verification fields" }, { status: 400 })
  }

  const orderId = String(internalOrderId)
  const razorpayOrderId = String(razorpay_order_id)
  const razorpayPaymentId = String(razorpay_payment_id)
  const razorpaySignature = String(razorpay_signature)

  const orderRecord = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, razorpayOrderId: true, paymentStatus: true } })
  if (!orderRecord) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  if (orderRecord.razorpayOrderId && orderRecord.razorpayOrderId !== razorpayOrderId) return NextResponse.json({ error: "Payment order mismatch" }, { status: 400 })

  const valid = await verifyRazorpayPaymentSignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  })
  if (!valid) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "failed",
        status: "placed",
        paymentMethod: "razorpay",
        paymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
      },
    }).catch(() => null)
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
  }

  // Guard against sending a duplicate confirmation email if the webhook already marked it paid.
  const before = orderRecord
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "paid",
      status: "confirmed",
      paymentMethod: "razorpay",
      paymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
      razorpaySignature: razorpaySignature,
      notes: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    },
  })

  await finalizePaidOrder(order, before?.paymentStatus === "paid")
  return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber, paymentStatus: order.paymentStatus } })
}
