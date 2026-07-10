import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

export async function GET() {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orders = await prisma.order.findMany({
    where: { email: session.email },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ orders })
}
