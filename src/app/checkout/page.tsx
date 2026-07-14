import { CheckoutClient } from "./checkout-client"
import { getBrandConfig } from "@/lib/brand-config"
import { privatePageMetadata } from "@/lib/seo"

export const metadata = privatePageMetadata("Checkout")

export default async function CheckoutPage() {
  const brand = await getBrandConfig()
  return <CheckoutClient brand={brand} />
}
