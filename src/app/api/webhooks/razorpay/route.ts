import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay-server"
import { sendOrderStatusUpdateEmail } from "@/lib/email"
import { finalizePaidOrder, releaseReservedCoupon } from "@/lib/payment-finalization"
import { isValidSafeId } from "@/lib/validation"

export const dynamic = "force-dynamic"

type RazorpayWebhook = {
  event?: string
  payload?: {
    payment?: {
      entity?: {
        id?: string
        order_id?: string
        notes?: { orderId?: string; orderNumber?: string }
      }
    }
  }
}

export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get("x-razorpay-signature")
  if (!(await verifyRazorpayWebhookSignature(raw, signature))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const event = JSON.parse(raw) as RazorpayWebhook
  const payment = event.payload?.payment?.entity
  const internalOrderId = payment?.notes?.orderId
  if (!internalOrderId) return NextResponse.json({ ok: true, ignored: true })
  if (!isValidSafeId(internalOrderId)) return NextResponse.json({ ok: true, ignored: true })

  if (event.event === "payment.captured") {
    // Skip the confirmation email if the client-verify path already marked it paid.
    const before = await prisma.order.findUnique({ where: { id: internalOrderId }, select: { paymentStatus: true } })
    if (!before) return NextResponse.json({ ok: true, ignored: true })
    const order = await prisma.order.update({
      where: { id: internalOrderId },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
        paymentMethod: "razorpay",
        paymentId: payment?.id ?? null,
        razorpayOrderId: payment?.order_id ?? null,
        razorpayPaymentId: payment?.id ?? null,
        notes: JSON.stringify({ razorpay_order_id: payment?.order_id, razorpay_payment_id: payment?.id }),
      },
    })
    await finalizePaidOrder(order, before?.paymentStatus === "paid")
  }

  if (event.event === "payment.failed") {
    const before = await prisma.order.findUnique({
      where: { id: internalOrderId },
      select: { paymentStatus: true, couponCode: true, couponUsageRecorded: true },
    })
    if (!before || before.paymentStatus === "paid") return NextResponse.json({ ok: true, ignored: true })
    const shouldReleaseCoupon = before.paymentStatus !== "failed" && before.couponUsageRecorded
    const order = await prisma.order.update({
      where: { id: internalOrderId },
      data: {
        paymentStatus: "failed",
        paymentMethod: "razorpay",
        paymentId: payment?.id ?? null,
        razorpayOrderId: payment?.order_id ?? null,
        razorpayPaymentId: payment?.id ?? null,
        couponUsageRecorded: shouldReleaseCoupon ? false : before.couponUsageRecorded,
        notes: JSON.stringify({ razorpay_order_id: payment?.order_id, razorpay_payment_id: payment?.id }),
      },
    })
    if (shouldReleaseCoupon) await releaseReservedCoupon(before)
    await sendOrderStatusUpdateEmail(order).catch(() => false)
  }

  return NextResponse.json({ ok: true })
}
