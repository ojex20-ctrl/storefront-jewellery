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
  return (
    <SettingsClient
      settings={settings}
      integrationStatus={{
        razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
        supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      }}
    />
  )
}
