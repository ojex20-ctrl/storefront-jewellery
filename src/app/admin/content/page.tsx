import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { ContentEditorClient } from "./content-editor-client"

export default async function AdminContentPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const sections = await prisma.siteContent.findMany({ orderBy: { sortOrder: "asc" } })
  return <ContentEditorClient sections={sections} />
}
