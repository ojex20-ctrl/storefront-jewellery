import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isNonNegativeMoney, isValidCouponCode, normalizeCouponCode } from "@/lib/validation"

export async function POST(req: Request) {
  const { code: rawCode, subtotal: rawSubtotal } = await req.json().catch(() => ({}))
  const code = normalizeCouponCode(rawCode)
  const subtotal = Number(rawSubtotal ?? 0)
  if (!isValidCouponCode(code)) return NextResponse.json({ error: "Enter a valid coupon code." }, { status: 400 })
  if (!isNonNegativeMoney(subtotal)) return NextResponse.json({ error: "Invalid cart subtotal." }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({ where: { code } })
  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
  if (!coupon.active) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 })
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return NextResponse.json({ error: "This coupon has expired" }, { status: 400 })
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 })
  if (coupon.minOrder && subtotal < coupon.minOrder) return NextResponse.json({ error: `Minimum order of ₹${(coupon.minOrder / 100).toLocaleString()} required` }, { status: 400 })

  const discount = Math.min(coupon.type === "percentage" ? Math.round((subtotal * coupon.value) / 100) : coupon.value, subtotal)
  return NextResponse.json({ valid: true, code: coupon.code, type: coupon.type, value: coupon.value, discount, message: coupon.type === "percentage" ? `${coupon.value}% off applied!` : `₹${(coupon.value / 100).toLocaleString()} off applied!` })
}
