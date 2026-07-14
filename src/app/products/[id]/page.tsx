import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"
import { Reviews } from "@/components/product/reviews"
import { fetchProduct, fetchProducts } from "@/lib/medusa-products"
import { JsonLd } from "@/components/seo/json-ld"
import { getBrandConfig } from "@/lib/brand-config"
import { productFaqJsonLd, productJsonLd } from "@/lib/seo-jsonld"

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const p = await fetchProduct(id)
  if (!p) notFound()
  const description = p.seoDescription || p.desc || p.caption || "Premium anti-tarnish jewellery by SYRA."
  return {
    title: p.seoTitle || `${p.name} - SYRA`,
    description,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title: p.name,
      description,
      images: p.image ? [p.image] : undefined,
      type: "website" as const,
    },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params
  const product = await fetchProduct(id)
  if (!product) notFound()
  const brand = await getBrandConfig()
  const all = await fetchProducts()
  const productTags = new Set(product.tags ?? [])
  const related = all
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const score = (p: typeof a) =>
        (p.kind === product.kind ? 4 : 0) +
        (p.mainHierarchy && p.mainHierarchy === product.mainHierarchy ? 2 : 0) +
        ((p.tags ?? []).filter((tag) => productTags.has(tag)).length)
      return score(b) - score(a)
    })
    .slice(0, 8)
  return (
    <Suspense>
      <JsonLd data={[productJsonLd(product), productFaqJsonLd()]} />
      <ProductDetailClient product={product} related={related} freeShippingThreshold={brand.free_shipping_threshold} />
      <Reviews productId={product.id} />
    </Suspense>
  )
}
