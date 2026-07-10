import crypto from "node:crypto"

export const RAZORPAY_SETUP_MESSAGE =
  "Online payment is currently being configured. Please try again later or contact support."

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

export function publicRazorpayKey() {
  return process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ""
}

export function verifyRazorpayPaymentSignature(input: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex")
  if (digest.length !== input.razorpaySignature.length) return false
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(input.razorpaySignature))
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex")
  if (digest.length !== signature.length) return false
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function createRazorpayOrder(input: {
  amount: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}) {
  if (!isRazorpayConfigured()) {
    throw new Error(RAZORPAY_SETUP_MESSAGE)
  }
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")
  const resp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      authorization: `Basic ${auth}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
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
