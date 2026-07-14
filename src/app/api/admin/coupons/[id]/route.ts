import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isNonNegativeMoney, isValidCouponCode, normalizeCouponCode, toNonNegativeInt } from "@/lib/validation"

type Ctx = { params: Promise<{ id: string }> }

function normalizeCouponPatch(data: Record<string, unknown>) {
  const patch: Record<string, unknown> = {}
  if ("code" in data) patch.code = normalizeCouponCode(data.code)
  if ("type" in data) patch.type = data.type === "fixed" ? "fixed" : "percentage"
  if ("value" in data) patch.value = toNonNegativeInt(data.value)
  if ("minOrder" in data) patch.minOrder = data.minOrder === "" || data.minOrder === null ? null : toNonNegativeInt(data.minOrder)
  if ("maxUses" in data) patch.maxUses = data.maxUses === "" || data.maxUses === null ? null : Math.max(1, toNonNegativeInt(data.maxUses, 1))
  if ("active" in data) patch.active = Boolean(data.active)
  if ("expiresAt" in data) {
    const date = data.expiresAt ? new Date(String(data.expiresAt)) : null
    patch.expiresAt = date && !Number.isNaN(date.getTime()) ? date : null
  }
  return patch
}

function couponError(data: Record<string, unknown>) {
  if (typeof data.code === "string" && !isValidCouponCode(data.code)) return "Enter a valid coupon code."
  if (data.type === "percentage" && typeof data.value === "number" && (data.value < 1 || data.value > 95)) return "Percentage discount must be between 1 and 95."
  if (data.type === "fixed" && typeof data.value === "number" && !isNonNegativeMoney(data.value)) return "Enter a valid fixed discount amount."
  if (typeof data.minOrder === "number" && !isNonNegativeMoney(data.minOrder)) return "Enter a valid minimum order amount."
  return null
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  const data = normalizeCouponPatch(await req.json().catch(() => ({})))
  const error = couponError(data)
  if (error) return NextResponse.json({ error }, { status: 400 })
  const coupon = await prisma.coupon.update({ where: { id }, data: data as any })
  return NextResponse.json({ coupon })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { id } = await params
  await prisma.coupon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
