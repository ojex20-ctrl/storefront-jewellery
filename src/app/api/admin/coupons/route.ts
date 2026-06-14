import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  data.code = (data.code ?? "").toUpperCase()
  const coupon = await prisma.coupon.create({ data })
  return NextResponse.json({ coupon }, { status: 201 })
}
