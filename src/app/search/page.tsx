import { Suspense } from "react"
import { CollectionClient } from "../collection/collection-client"
import { fetchProducts } from "@/lib/medusa-products"

export const metadata = { title: "Search — SYRA" }

/**
 * /search reuses the collection client — the listing already binds its
 * filter state to URL params (including `?q=…`), so the same UI doubles
 * as both an A-Z catalogue and a search results page.
 */
export default async function SearchPage() {
  const products = await fetchProducts()
  return (
    <Suspense>
      <CollectionClient products={products} />
    </Suspense>
  )
}
