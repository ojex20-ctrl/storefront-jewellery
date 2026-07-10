"use client"
import Link from "next/link"
import { priceFmt } from "@podium/ui/lib"
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store"
import { OptimizedImage } from "@/components/media/optimized-image"

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const items = useRecentlyViewedStore((s) => s.items).filter((x) => x.id !== excludeId).slice(0, 6)
  if (items.length === 0) return null

  return (
    <section className="border-t border-line bg-bg px-6 py-14 md:px-12">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="mb-8 font-display text-3xl text-ink">Recently Viewed</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {items.map((item) => (
            <Link key={item.id} href={`/products/${item.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-bg-2">
                <OptimizedImage src={item.image} alt={item.name} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-ink">{item.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{priceFmt(item.price)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
