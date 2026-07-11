import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Anonymized recent-purchase feed for the social-proof popup — real paid orders
 * only (first name + product), no contact details. Returns [] when there are
 * none, so the UI shows nothing rather than fabricated events.
 */
export async function GET() {
  const orders = await prisma.order
    .findMany({
      where: { paymentStatus: "paid" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { firstName: true, items: true },
    })
    .catch(() => [])

  const events = orders.map((o) => {
    let item = "a piece"
    try {
      const items = JSON.parse(o.items) as Array<{ name?: string }>
      if (items[0]?.name) item = items[0].name
    } catch { /* ignore */ }
    return { name: (o.firstName || "Someone").split(" ")[0], item }
  })

  return NextResponse.json({ events })
}
