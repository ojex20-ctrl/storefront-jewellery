import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { ProductFormClient } from "../product-form-client"

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) redirect("/admin/products")
  return <ProductFormClient product={product} />
}
