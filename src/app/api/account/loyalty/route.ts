import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

export async function GET() {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orders = await prisma.order.findMany({ where: { email: session.email } })
  const spend = orders.reduce((sum, order) => sum + order.total, 0)
  const points = Math.floor(spend / 100)
  const storeCredits = Math.floor(points / 100) * 5000
  return NextResponse.json({
    rewards: { points, tier: points > 2500 ? "Gold" : points > 1000 ? "Silver" : "Member" },
    storeCredits,
    referralCode: `SYRA-${session.id.slice(-6).toUpperCase()}`,
  })
}
