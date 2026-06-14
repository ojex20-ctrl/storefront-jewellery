import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { ProductsListClient } from "./products-list-client"

export default async function AdminProductsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })
  return <ProductsListClient products={products} user={session} />
}
