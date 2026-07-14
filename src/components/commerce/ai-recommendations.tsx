"use client"
import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/products"

export function AIRecommendations({ productId }: { productId: string }) {
  const [items, setItems] = useState<Product[]>([])
  useEffect(() => {
    void fetch(`/api/recommendations?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((data) => setItems(data.products ?? []))
      .catch(() => {})
  }, [productId])
  if (items.length === 0) return null
  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 border-t border-line">
      <h2 className="text-xl font-semibold mb-8">Recommended For You</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {items.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  )
}
