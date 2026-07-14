import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { CustomersClient } from "./customers-client"

export default async function AdminCustomersPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const [customers, orders] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ select: { email: true, total: true, paymentStatus: true } }),
  ])

  const byEmail: Record<string, { count: number; paidTotal: number }> = {}
  for (const o of orders) {
    const k = o.email.toLowerCase()
    byEmail[k] = byEmail[k] || { count: 0, paidTotal: 0 }
    byEmail[k].count += 1
    if (o.paymentStatus === "paid") byEmail[k].paidTotal += o.total
  }

  const rows = customers.map((c) => ({
    id: c.id,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    verified: c.verified || c.emailVerified,
    createdAt: c.createdAt.toISOString(),
    orders: byEmail[c.email.toLowerCase()]?.count ?? 0,
    spent: byEmail[c.email.toLowerCase()]?.paidTotal ?? 0,
  }))

  return <CustomersClient customers={rows} user={session} />
}
