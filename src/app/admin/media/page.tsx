import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { MediaClient } from "./media-client"

export default async function AdminMediaPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  return <MediaClient user={session} />
}
