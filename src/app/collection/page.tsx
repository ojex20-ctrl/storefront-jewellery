import { Suspense } from "react"
import { CollectionClient } from "./collection-client"
import { fetchProducts } from "@/lib/medusa-products"
import { JsonLd } from "@/components/seo/json-ld"
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo-jsonld"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Anti-Tarnish Jewellery Collection",
  description: "Shop SYRA rings, earrings, necklaces and bracelets made with waterproof, hypoallergenic anti-tarnish finishes for everyday wear.",
  path: "/collection",
  image: "/hero/syra_hero_1.png",
})

export default async function CollectionPage() {
  const products = await fetchProducts()
  return (
    <Suspense>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", url: "/" }, { name: "Collection", url: "/collection" }]), collectionJsonLd(products)]} />
      <CollectionClient products={products} />
    </Suspense>
  )
}
