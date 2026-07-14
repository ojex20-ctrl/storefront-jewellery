import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isNonNegativeMoney, isValidCouponCode, normalizeCouponCode, toNonNegativeInt } from "@/lib/validation"

function normalizeCoupon(data: Record<string, unknown>) {
  const code = normalizeCouponCode(data.code)
  const type = data.type === "fixed" ? "fixed" : "percentage"
  const value = toNonNegativeInt(data.value)
  const minOrder = data.minOrder === "" || data.minOrder === null || data.minOrder === undefined ? null : toNonNegativeInt(data.minOrder)
  const maxUses = data.maxUses === "" || data.maxUses === null || data.maxUses === undefined ? null : Math.max(1, toNonNegativeInt(data.maxUses, 1))
  const expiresAt = data.expiresAt ? new Date(String(data.expiresAt)) : null
  return { code, type, value, minOrder, maxUses, active: data.active !== false, expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null }
}

function couponError(data: ReturnType<typeof normalizeCoupon>) {
  if (!isValidCouponCode(data.code)) return "Enter a valid coupon code."
  if (data.type === "percentage" && (data.value < 1 || data.value > 95)) return "Percentage discount must be between 1 and 95."
  if (data.type === "fixed" && !isNonNegativeMoney(data.value)) return "Enter a valid fixed discount amount."
  if (data.minOrder !== null && !isNonNegativeMoney(data.minOrder)) return "Enter a valid minimum order amount."
  return null
}

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ coupons })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = normalizeCoupon(await req.json().catch(() => ({})))
  const error = couponError(data)
  if (error) return NextResponse.json({ error }, { status: 400 })
  const coupon = await prisma.coupon.create({ data })
  return NextResponse.json({ coupon }, { status: 201 })
}
