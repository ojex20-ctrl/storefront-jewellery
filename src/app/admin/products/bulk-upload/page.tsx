import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { BulkUploadClient } from "./bulk-upload-client"

export default async function BulkUploadPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")
  return <BulkUploadClient />
}
