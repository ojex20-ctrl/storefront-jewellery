import { WishlistClient } from "./wishlist-client"
import { fetchProducts } from "@/lib/medusa-products"

export const metadata = { title: "Wishlist" }

export default async function Page() {
  const products = await fetchProducts()
  return <WishlistClient products={products} />
}
