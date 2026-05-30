import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const { code, subtotal } = await req.json()
  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
  if (!coupon.active) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 })
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return NextResponse.json({ error: "This coupon has expired" }, { status: 400 })
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 })
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return NextResponse.json({ error: `Minimum order of ₹${(coupon.minOrder / 100).toLocaleString()} required` }, { status: 400 })
  }

  let discount = 0
  if (coupon.type === "percentage") {
    discount = Math.round((subtotal * coupon.value) / 100)
  } else {
    discount = coupon.value
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
    message: coupon.type === "percentage" ? `${coupon.value}% off applied!` : `₹${(coupon.value / 100).toLocaleString()} off applied!`,
  })
}
