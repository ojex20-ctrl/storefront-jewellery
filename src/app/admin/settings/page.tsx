import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { SettingsClient } from "./settings-client"

export default async function AdminSettingsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const raw = await prisma.setting.findMany()
  const settings: Record<string, string> = {}
  for (const s of raw) settings[s.key] = s.value
  return <SettingsClient settings={settings} />
}
