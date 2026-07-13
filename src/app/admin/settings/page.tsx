import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { SettingsClient } from "./settings-client"
import { effectivePaymentSettingsForForm, getPaymentSettings } from "@/lib/payment-settings"

export default async function AdminSettingsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const raw = await prisma.setting.findMany()
  const settings: Record<string, string> = {}
  for (const s of raw) settings[s.key] = s.value
  const payment = await getPaymentSettings(settings)
  return (
    <SettingsClient
      settings={effectivePaymentSettingsForForm(settings, payment)}
      user={session}
      integrationStatus={{
        razorpayConfigured: payment.razorpay.configured,
        razorpayEnabled: payment.razorpay.enabled,
        razorpayMode: payment.razorpay.mode,
        razorpayKeyId: payment.razorpay.keyId,
        razorpayWebhookConfigured: payment.razorpay.webhookConfigured,
        stripeConfigured: payment.stripe.configured,
        smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
        supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      }}
    />
  )
}
