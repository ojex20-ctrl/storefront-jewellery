import { prisma } from "@/lib/db"

export type PaymentProviderId = "razorpay" | "stripe"

type SettingsMap = Record<string, string | undefined>

export const SECRET_SETTING_KEYS = new Set([
  "payment_razorpay_key_secret",
  "payment_razorpay_webhook_secret",
  "payment_stripe_secret_key",
  "payment_stripe_webhook_secret",
  "smtp_pass",
  "smtp_password",
  "google_client_secret",
])

const DEFAULT_RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js"
const DEFAULT_RAZORPAY_ORDERS_API_URL = "https://api.razorpay.com/v1/orders"

export function isSecretSettingKey(key: string) {
  return SECRET_SETTING_KEYS.has(key) || /(_secret|_password|_token)$/i.test(key)
}

export function sanitizeSettingsForClient(settings: Record<string, string>) {
  const safe: Record<string, string> = {}
  for (const [key, value] of Object.entries(settings)) {
    safe[key] = isSecretSettingKey(key) ? "" : value
  }
  return safe
}

export async function loadSettingsMap(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany()
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}

export function resolveEnabledPaymentProviders(settings: SettingsMap): PaymentProviderId[] {
  const rawProviders = settings.payment_enabled_providers ?? settings.enabled_payment_providers
  if (rawProviders !== undefined && rawProviders.trim() !== "") return parseProviderList(rawProviders)

  const providers: PaymentProviderId[] = []
  if (readBool(settings.payment_razorpay_enabled, true)) providers.push("razorpay")
  if (readBool(settings.payment_stripe_enabled, false)) providers.push("stripe")
  return providers
}

export async function getPaymentSettings(existing?: Record<string, string>) {
  const settings = existing ?? await loadSettingsMap()
  const razorpayKeyId = firstValue(
    settings.payment_razorpay_key_id,
    process.env.RAZORPAY_KEY_ID,
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  )
  const razorpayKeySecret = firstValue(settings.payment_razorpay_key_secret, process.env.RAZORPAY_KEY_SECRET)
  const razorpayWebhookSecret = firstValue(settings.payment_razorpay_webhook_secret, process.env.RAZORPAY_WEBHOOK_SECRET)
  const stripePublishableKey = firstValue(settings.payment_stripe_publishable_key, process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  const stripeSecretKey = firstValue(settings.payment_stripe_secret_key, process.env.STRIPE_SECRET_KEY)
  const enabledProviders = resolveEnabledPaymentProviders(settings)
  const defaultProvider = normalizeProvider(settings.payment_default_provider) ?? enabledProviders[0] ?? "razorpay"

  return {
    enabledProviders,
    defaultProvider,
    razorpay: {
      enabled: readBool(settings.payment_razorpay_enabled, enabledProviders.includes("razorpay")),
      configured: Boolean(razorpayKeyId && razorpayKeySecret),
      keyId: razorpayKeyId,
      keySecret: razorpayKeySecret,
      webhookSecret: razorpayWebhookSecret,
      webhookConfigured: Boolean(razorpayWebhookSecret),
      mode: normalizeMode(settings.payment_razorpay_mode),
      currency: normalizeCurrency(settings.payment_razorpay_currency ?? settings.payment_currency ?? "INR"),
      checkoutThemeColor: normalizeHex(settings.payment_razorpay_theme_color) ?? "#c9a36b",
      checkoutScriptUrl: firstValue(settings.payment_razorpay_checkout_script_url, DEFAULT_RAZORPAY_SCRIPT_URL),
      ordersApiUrl: firstValue(settings.payment_razorpay_orders_api_url, DEFAULT_RAZORPAY_ORDERS_API_URL),
    },
    stripe: {
      enabled: readBool(settings.payment_stripe_enabled, enabledProviders.includes("stripe")),
      configured: Boolean(stripePublishableKey && stripeSecretKey),
      publishableKey: stripePublishableKey,
      secretKey: stripeSecretKey,
      webhookSecret: firstValue(settings.payment_stripe_webhook_secret, process.env.STRIPE_WEBHOOK_SECRET),
    },
  }
}

export function effectivePaymentSettingsForForm(settings: Record<string, string>, payment: Awaited<ReturnType<typeof getPaymentSettings>>) {
  return {
    ...sanitizeSettingsForClient(settings),
    payment_razorpay_enabled: String(payment.razorpay.enabled),
    payment_razorpay_mode: payment.razorpay.mode,
    payment_razorpay_key_id: payment.razorpay.keyId,
    payment_razorpay_currency: payment.razorpay.currency,
    payment_razorpay_theme_color: payment.razorpay.checkoutThemeColor,
    payment_razorpay_checkout_script_url: payment.razorpay.checkoutScriptUrl,
    payment_razorpay_orders_api_url: payment.razorpay.ordersApiUrl,
    payment_stripe_enabled: String(payment.stripe.enabled),
    payment_stripe_publishable_key: payment.stripe.publishableKey,
    payment_default_provider: payment.defaultProvider,
    payment_enabled_providers: JSON.stringify(payment.enabledProviders),
    payment_razorpay_key_secret: "",
    payment_razorpay_webhook_secret: "",
    payment_stripe_secret_key: "",
    payment_stripe_webhook_secret: "",
  }
}

function firstValue(...values: Array<string | undefined | null>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value.trim()
  }
  return ""
}

function readBool(raw: string | undefined, fallback: boolean) {
  if (raw === undefined || raw === "") return fallback
  return ["1", "true", "yes", "on", "enabled"].includes(raw.toLowerCase())
}

function normalizeCurrency(raw: string) {
  const value = raw.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(value) ? value : "INR"
}

function normalizeHex(raw: string | undefined) {
  if (!raw) return null
  const value = raw.trim()
  return /^#[0-9A-F]{6}$/i.test(value) ? value : null
}

function normalizeMode(raw: string | undefined): "test" | "live" {
  return raw === "live" ? "live" : "test"
}

function normalizeProvider(raw: string | undefined): PaymentProviderId | null {
  if (raw === "razorpay" || raw === "stripe") return raw
  return null
}

function parseProviderList(raw: string | undefined): PaymentProviderId[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return parsed.map((value) => normalizeProvider(String(value))).filter((value): value is PaymentProviderId => Boolean(value))
  } catch {}
  return raw
    .split(",")
    .map((value) => normalizeProvider(value.trim()))
    .filter((value): value is PaymentProviderId => Boolean(value))
}
