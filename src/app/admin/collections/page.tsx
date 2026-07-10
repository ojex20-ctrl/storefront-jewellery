import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { CollectionsClient } from "./collections-client"

export default async function AdminCollectionsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  return <CollectionsClient categories={categories} user={session} />
}
