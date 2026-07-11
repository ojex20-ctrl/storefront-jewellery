import { prisma } from "@/lib/db"
import { sendOrderStatusUpdateEmail } from "@/lib/email"

export const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const

export type SyraOrderStatus = (typeof ORDER_STATUSES)[number]
export type SyraPaymentStatus = (typeof PAYMENT_STATUSES)[number]

export function isOrderStatus(value: string): value is SyraOrderStatus {
  return ORDER_STATUSES.includes(value as SyraOrderStatus)
}

export function isPaymentStatus(value: string): value is SyraPaymentStatus {
  return PAYMENT_STATUSES.includes(value as SyraPaymentStatus)
}

/**
 * No-op on MongoDB — the OrderStatusHistory collection is created lazily by
 * Prisma. Kept for call-site compatibility (was a CREATE TABLE on SQLite).
 */
export async function ensureOrderStatusHistoryTable() {
  // intentionally empty
}

export async function addOrderStatusHistory(input: {
  orderId: string
  oldStatus?: string | null
  newStatus: string
  changedBy?: string | null
  note?: string | null
}) {
  await prisma.orderStatusHistory.create({
    data: {
      orderId: input.orderId,
      oldStatus: input.oldStatus ?? null,
      newStatus: input.newStatus,
      changedBy: input.changedBy ?? null,
      note: input.note ?? null,
    },
  })
}

export async function updateOrderStatus(input: {
  orderId: string
  status: SyraOrderStatus
  changedBy?: string | null
  note?: string | null
}) {
  const current = await prisma.order.findUnique({ where: { id: input.orderId } })
  if (!current) throw new Error("Order not found")
  const order = await prisma.order.update({
    where: { id: input.orderId },
    data: { status: input.status },
  })
  if (current.status !== input.status) {
    await addOrderStatusHistory({
      orderId: input.orderId,
      oldStatus: current.status,
      newStatus: input.status,
      changedBy: input.changedBy,
      note: input.note,
    })
    await sendOrderStatusUpdateEmail(order).catch(() => false)
  }
  return order
}
