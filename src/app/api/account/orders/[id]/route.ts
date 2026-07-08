import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const order = await prisma.order.findFirst({ where: { id, email: session.email } })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ order })
}
