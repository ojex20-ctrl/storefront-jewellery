import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isSecretSettingKey } from "@/lib/payment-settings"
import { isNonNegativeMoney, isValidEmail, isValidPhone, isValidUrlOrPath } from "@/lib/validation"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "settings:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const settings = await prisma.setting.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = isSecretSettingKey(s.key) ? "" : s.value
  return NextResponse.json({ settings: map })
}

function settingError(key: string, value: string) {
  if (!/^[a-z0-9_:-]{1,120}$/i.test(key)) return `Invalid setting key: ${key}`
  if (value.length > 20000) return `Setting ${key} is too large.`
  if ((key.endsWith("_url") || key.endsWith("_link") || key === "logo_url") && value && !isValidUrlOrPath(value)) return `Setting ${key} must be a valid URL or site path.`
  if (key.endsWith("_email") && value && !isValidEmail(value)) return `Setting ${key} must be a valid email address.`
  if ((key.endsWith("_phone") || key === "whatsapp_number" || key === "shop_whatsapp") && value && !isValidPhone(value)) return `Setting ${key} must be a valid phone number.`
  if ((key.endsWith("_hex") || key.endsWith("_color")) && value && !/^#[0-9a-f]{6}$/i.test(value)) return `Setting ${key} must be a hex color.`
  if (key.endsWith("_currency") && value && !/^[A-Z]{3}$/.test(value.toUpperCase())) return `Setting ${key} must be a 3-letter currency code.`
  if (["free_shipping_threshold", "shipping_standard_rate", "shipping_express_rate"].includes(key) && !isNonNegativeMoney(Number(value))) return `Setting ${key} must be a non-negative amount.`
  if (key === "payment_razorpay_mode" && value && value !== "test" && value !== "live") return "Razorpay mode must be test or live."
  if (key === "payment_default_provider" && value && value !== "razorpay" && value !== "stripe") return "Default payment provider must be razorpay or stripe."
  return null
}

export async function PUT(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "settings:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = await req.json().catch(() => ({})) as Record<string, unknown>
  for (const [key, rawValue] of Object.entries(data)) {
    const value = typeof rawValue === "string" ? rawValue.trim() : JSON.stringify(rawValue ?? "")
    if (isSecretSettingKey(key) && value === "") continue
    const error = settingError(key, value)
    if (error) return NextResponse.json({ error }, { status: 400 })
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }
  return NextResponse.json({ ok: true })
}
