import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { OrdersListClient } from "./orders-list-client"

export default async function AdminOrdersPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50 })
  return <OrdersListClient orders={orders} />
}
