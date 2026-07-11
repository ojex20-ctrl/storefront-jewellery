import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Minimal public order-status lookup by internal id (an unguessable cuid the
 * buyer holds from the confirmation URL). Returns only status fields — no PII.
 * Used by the confirmation page to show live payment/fulfilment status.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Order id required" }, { status: 400 })
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ order })
}
