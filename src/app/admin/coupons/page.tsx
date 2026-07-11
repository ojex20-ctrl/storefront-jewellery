import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { CouponsClient } from "./coupons-client"

export default async function AdminCouponsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")
  const rows = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
  const coupons = rows.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minOrder: c.minOrder,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }))
  return <CouponsClient coupons={coupons} user={session} />
}
