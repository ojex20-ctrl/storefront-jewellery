import { CheckoutClient } from "./checkout-client"
import { getBrandConfig } from "@/lib/brand-config"

export const metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const brand = await getBrandConfig()
  return <CheckoutClient brand={brand} />
}
