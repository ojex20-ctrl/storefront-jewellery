import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { ProductFormClient } from "../product-form-client"

export default async function NewProductPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")
  return <ProductFormClient product={null} />
}
