import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { AdminDashboard } from "./dashboard-client"

export default async function AdminPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const [productCount, orderCount, recentOrders] = await Promise.all([
    prisma.product.count({ where: { published: true } }),
    prisma.order.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ])

  return (
    <AdminDashboard
      user={session}
      stats={{ products: productCount, orders: orderCount }}
      recentOrders={recentOrders}
    />
  )
}
