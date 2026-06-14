import { Suspense } from "react"
import { CollectionClient } from "./collection-client"
import { fetchProducts } from "@/lib/medusa-products"

export const metadata = { title: "Collection — SYRA" }

export default async function CollectionPage() {
  const products = await fetchProducts()
  return (
    <Suspense>
      <CollectionClient products={products} />
    </Suspense>
  )
}
