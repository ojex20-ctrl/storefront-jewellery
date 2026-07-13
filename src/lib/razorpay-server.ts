import crypto from "node:crypto"
import { getPaymentSettings } from "./payment-settings"

export const RAZORPAY_SETUP_MESSAGE =
  "Online payment is currently being configured. Please try again later or contact support."

export async function isRazorpayConfigured() {
  const payment = await getPaymentSettings()
  return payment.razorpay.enabled && payment.razorpay.configured
}

export async function publicRazorpayKey() {
  const payment = await getPaymentSettings()
  return payment.razorpay.keyId
}

export async function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) {
  const payment = await getPaymentSettings()
  const secret = payment.razorpay.keySecret
  if (!payment.razorpay.enabled || !secret) return false
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex")
  if (digest.length !== input.razorpaySignature.length) return false
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(input.razorpaySignature))
}

export async function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  const payment = await getPaymentSettings()
  const secret = payment.razorpay.webhookSecret
  if (!payment.razorpay.enabled || !secret || !signature) return false
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  if (digest.length !== signature.length) return false
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function createRazorpayOrder(input: {
  amount: number
  currency?: string
  receipt: string
  notes?: Record<string, string>
}) {
  const payment = await getPaymentSettings()
  if (!payment.razorpay.enabled || !payment.razorpay.configured) {
    throw new Error(RAZORPAY_SETUP_MESSAGE)
  }
  const auth = Buffer.from(`${payment.razorpay.keyId}:${payment.razorpay.keySecret}`).toString("base64")
  const resp = await fetch(payment.razorpay.ordersApiUrl, {
    method: "POST",
    headers: {
      authorization: `Basic ${auth}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? payment.razorpay.currency,
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    throw new Error(typeof data?.error?.description === "string" ? data.error.description : "Razorpay order failed")
  }
  return data as { id: string; amount: number; currency: string; receipt: string }
}
