"use client"
import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/products"

export function FrequentlyBoughtTogether({ product, related }: { product: Product; related: Product[] }) {
  const productTags = new Set(product.tags ?? [])
  const items = related
    .filter((p) => p.kind === product.kind || (p.tags ?? []).some((tag) => productTags.has(tag)))
    .slice(0, 3)
  if (items.length === 0) return null
  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 border-t border-gray-100">
      <h2 className="text-xl font-semibold mb-8">Frequently Bought Together</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <ProductCard product={product} />
        {items.map((p, i) => <ProductCard key={p.id} product={p} index={i + 1} />)}
      </div>
    </section>
  )
}

export function CompleteTheLook({ product, related }: { product: Product; related: Product[] }) {
  const productTags = new Set(product.tags ?? [])
  const picks = related
    .filter((p) => p.mainHierarchy === product.mainHierarchy || (p.tags ?? []).some((tag) => productTags.has(tag)))
    .slice(0, 4)
  if (picks.length === 0) return null
  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 border-t border-gray-100">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold">Complete The Look</h2>
        <Link href="/collection" className="font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-black">View all</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {picks.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  )
}
