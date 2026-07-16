import type { Order } from "@prisma/client"
import { prisma } from "@/lib/db"
import { sendAdminNewOrderAlert, sendOrderPlacedEmail } from "@/lib/email"

export async function recordCouponUsage(order: Pick<Order, "id" | "couponCode" | "couponUsageRecorded" | "subtotal">) {
  if (!order.couponCode || order.couponUsageRecorded) return

  const coupon = await prisma.coupon.findUnique({ where: { code: order.couponCode } }).catch(() => null)
  if (!coupon) return

  const result = await prisma.coupon.updateMany({
    where: {
      code: order.couponCode,
      active: true,
      OR: [{ maxUses: null }, { usedCount: { lt: coupon.maxUses ?? 0 } }],
      ...(coupon.expiresAt ? { expiresAt: { gte: new Date() } } : {}),
      ...(coupon.minOrder ? { minOrder: { lte: order.subtotal } } : {}),
    },
    data: { usedCount: { increment: 1 } },
  }).catch(() => ({ count: 0 }))

  if (result.count > 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { couponUsageRecorded: true },
    }).catch(() => null)
  }
}

export async function releaseReservedCoupon(order: Pick<Order, "couponCode" | "couponUsageRecorded">) {
  if (!order.couponCode || !order.couponUsageRecorded) return
  await prisma.coupon.updateMany({
    where: { code: order.couponCode, usedCount: { gt: 0 } },
    data: { usedCount: { decrement: 1 } },
  }).catch(() => null)
}

export async function finalizePaidOrder(order: Order, wasAlreadyPaid: boolean) {
  if (wasAlreadyPaid) return

  await recordCouponUsage(order)

  await Promise.all([
    sendOrderPlacedEmail(order).catch(() => false),
    sendAdminNewOrderAlert(order).catch(() => false),
  ])
}
