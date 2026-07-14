import { CartClient } from "./cart-client"
import { getBrandConfig } from "@/lib/brand-config"
import { privatePageMetadata } from "@/lib/seo"

export const metadata = privatePageMetadata("Your Bag")

export default async function CartPage() {
  const brand = await getBrandConfig()
  return (
    <CartClient
      freeShippingOver={brand.free_shipping_threshold}
      standardRate={brand.shipping_standard_rate}
    />
  )
}
