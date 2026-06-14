// [MOCK] Backend disabled for UI-only development.
// Payment provider resolution returns static mock choices without hitting Medusa.

// import { medusa } from "./medusa"
import type { BrandConfig } from "./brand-config"

export type PaymentChoice = {
  id: string
  label: string
  description: string
  badge: string
}

const MOCK_CHOICES: PaymentChoice[] = [
  {
    id: "pp_razorpay_razorpay",
    label: "Razorpay",
    description: "UPI · Cards · Wallets · Netbanking",
    badge: "INDIA · UAE",
  },
  {
    id: "pp_stripe_stripe",
    label: "Stripe",
    description: "International cards · Apple Pay",
    badge: "GLOBAL",
  },
]

export async function resolvePaymentChoices(
  _regionId: string | null,
  _brand: BrandConfig,
): Promise<PaymentChoice[]> {
  // [MOCK] Return static payment choices without hitting Medusa
  return MOCK_CHOICES
}
