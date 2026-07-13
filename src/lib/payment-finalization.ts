import type { Order } from "@prisma/client"
import { prisma } from "@/lib/db"
import { sendAdminNewOrderAlert, sendOrderPlacedEmail } from "@/lib/email"

export async function finalizePaidOrder(order: Order, wasAlreadyPaid: boolean) {
  if (wasAlreadyPaid) return

  if (order.couponCode) {
    await prisma.coupon
      .update({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } })
      .catch(() => null)
  }

  await Promise.all([
    sendOrderPlacedEmail(order).catch(() => false),
    sendAdminNewOrderAlert(order).catch(() => false),
  ])
}
