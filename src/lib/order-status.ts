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

export async function ensureOrderStatusHistoryTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS OrderStatusHistory (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      oldStatus TEXT,
      newStatus TEXT NOT NULL,
      changedBy TEXT,
      note TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS OrderStatusHistory_orderId_idx ON OrderStatusHistory(orderId)
  `)
}

export async function addOrderStatusHistory(input: {
  orderId: string
  oldStatus?: string | null
  newStatus: string
  changedBy?: string | null
  note?: string | null
}) {
  await ensureOrderStatusHistoryTable()
  await prisma.$executeRawUnsafe(
    `INSERT INTO OrderStatusHistory (id, orderId, oldStatus, newStatus, changedBy, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    `osh_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    input.orderId,
    input.oldStatus ?? null,
    input.newStatus,
    input.changedBy ?? null,
    input.note ?? null,
  )
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
