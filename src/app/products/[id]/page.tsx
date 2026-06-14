import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"
import { fetchProduct, fetchProducts } from "@/lib/medusa-products"

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const p = await fetchProduct(id)
  return { title: p?.name ? `${p.name} — SYRA` : id.toUpperCase() }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params
  const product = await fetchProduct(id)
  if (!product) notFound()
  const all = await fetchProducts()
  const related = all.filter((p) => p.id !== product.id).slice(0, 4)
  // Suspense boundary because the client reads `?mode=rent` via useSearchParams.
  return (
    <Suspense>
      <ProductDetailClient product={product} related={related} />
    </Suspense>
  )
}
