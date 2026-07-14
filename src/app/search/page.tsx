import { Suspense } from "react"
import { fetchProducts } from "@/lib/medusa-products"
import { SearchClient } from "./search-client"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Search SYRA Jewellery",
  description: "Search SYRA anti-tarnish rings, earrings, necklaces and bracelets.",
  path: "/search",
  noIndex: true,
})

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string | string[] }
}) {
  const products = await fetchProducts()
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] ?? "" : searchParams.q ?? ""
  return (
    <Suspense>
      <SearchClient products={products} initialQuery={q} />
    </Suspense>
  )
}
