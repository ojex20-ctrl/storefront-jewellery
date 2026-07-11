import { CartClient } from "./cart-client"
import { getBrandConfig } from "@/lib/brand-config"

export const metadata = {
  title: "Your Bag",
  description: "Review the pieces in your bag before checkout.",
}

export default async function CartPage() {
  const brand = await getBrandConfig()
  return (
    <CartClient
      freeShippingOver={brand.free_shipping_threshold}
      standardRate={brand.shipping_standard_rate}
    />
  )
}
