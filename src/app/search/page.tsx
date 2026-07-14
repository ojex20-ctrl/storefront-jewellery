import { Suspense } from "react"
import { fetchProducts } from "@/lib/medusa-products"
import { SearchClient } from "./search-client"

export const metadata = { title: "Search — SYRA" }

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
