import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { BannersClient } from "./banners-client"

export default async function AdminBannersPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } })
  return <BannersClient banners={banners} />
}
