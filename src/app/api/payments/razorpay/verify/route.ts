import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay-server"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

export async function POST(req: Request) {
  const body = await req.json()
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

  if (!internalOrderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing Razorpay verification fields" }, { status: 400 })
  }

  const valid = verifyRazorpayPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  })
  if (!valid) {
    await prisma.order.update({
      where: { id: internalOrderId },
      data: { paymentStatus: "failed", status: "placed", paymentId: razorpay_payment_id },
    }).catch(() => null)
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
  }

  // Guard against sending a duplicate confirmation email if the webhook already marked it paid.
  const before = await prisma.order.findUnique({ where: { id: internalOrderId }, select: { paymentStatus: true } })
  const order = await prisma.order.update({
    where: { id: internalOrderId },
    data: {
      paymentStatus: "paid",
      status: "confirmed",
      paymentMethod: "razorpay",
      paymentId: razorpay_payment_id,
      notes: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    },
  })

  if (before?.paymentStatus !== "paid") {
    await sendOrderStatusUpdateEmail(order).catch(() => false)
  }
  return NextResponse.json({ order: { id: order.id, orderNumber: order.orderNumber, paymentStatus: order.paymentStatus } })
}
