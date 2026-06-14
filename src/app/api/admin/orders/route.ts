import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

export async function GET(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const limit = parseInt(url.searchParams.get("limit") ?? "20")
  const status = url.searchParams.get("status")

  const where = status ? { status } : {}
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])
  return NextResponse.json({ orders, total, page, limit })
}
