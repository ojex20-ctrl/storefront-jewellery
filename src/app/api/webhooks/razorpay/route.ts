import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay-server"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

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
  if (!verifyRazorpayWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  const event = JSON.parse(raw) as RazorpayWebhook
  const payment = event.payload?.payment?.entity
  const internalOrderId = payment?.notes?.orderId
  if (!internalOrderId) return NextResponse.json({ ok: true, ignored: true })

  if (event.event === "payment.captured") {
    // Skip the confirmation email if the client-verify path already marked it paid.
    const before = await prisma.order.findUnique({ where: { id: internalOrderId }, select: { paymentStatus: true } })
    const order = await prisma.order.update({
      where: { id: internalOrderId },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
        paymentMethod: "razorpay",
        paymentId: payment?.id ?? null,
        notes: JSON.stringify({ razorpay_order_id: payment?.order_id, razorpay_payment_id: payment?.id }),
      },
    })
    if (before?.paymentStatus !== "paid") {
      await sendOrderStatusUpdateEmail(order).catch(() => false)
    }
  }

  if (event.event === "payment.failed") {
    const order = await prisma.order.update({
      where: { id: internalOrderId },
      data: {
        paymentStatus: "failed",
        paymentMethod: "razorpay",
        paymentId: payment?.id ?? null,
        notes: JSON.stringify({ razorpay_order_id: payment?.order_id, razorpay_payment_id: payment?.id }),
      },
    })
    await sendOrderStatusUpdateEmail(order).catch(() => false)
  }

  return NextResponse.json({ ok: true })
}
