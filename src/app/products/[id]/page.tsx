import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ProductDetailClient } from "./product-detail-client"
import { Reviews } from "@/components/product/reviews"
import { fetchProduct, fetchProducts } from "@/lib/medusa-products"
import { JsonLd } from "@/components/seo/json-ld"
import { getBrandConfig } from "@/lib/brand-config"
import { breadcrumbJsonLd, productFaqJsonLd, productJsonLd } from "@/lib/seo-jsonld"
import { absoluteImage, absoluteUrl, trimDescription } from "@/lib/seo"

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params
  const p = await fetchProduct(id)
  if (!p) notFound()
  const description = trimDescription(p.seoDescription || p.desc || p.caption || "Premium anti-tarnish jewellery by SYRA.")
  const title = p.seoTitle || `${p.name} | Anti-Tarnish ${p.kind}`
  const image = absoluteImage(p.image)
  const canonical = absoluteUrl(`/products/${id}`)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "SYRA",
      images: [{ url: image, width: 1200, height: 630, alt: p.name }],
      type: "website" as const,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
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
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Collection", url: "/collection" },
            { name: product.kind, url: `/collection?kind=${encodeURIComponent(product.kind)}` },
            { name: product.name, url: `/products/${product.id}` },
          ]),
          productJsonLd(product),
          productFaqJsonLd(),
        ]}
      />
      <ProductDetailClient product={product} related={related} freeShippingThreshold={brand.free_shipping_threshold} />
      <Reviews productId={product.id} />
    </Suspense>
  )
}
