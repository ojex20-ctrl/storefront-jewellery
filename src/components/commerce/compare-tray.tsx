"use client"
import Link from "next/link"
import { X } from "lucide-react"
import { priceFmt } from "@podium/ui/lib"
import { useCompareStore } from "@/stores/compare-store"
import type { Product } from "@/lib/products"
import { OptimizedImage } from "@/components/media/optimized-image"

export function CompareTray({ products }: { products: Product[] }) {
  const ids = useCompareStore((s) => s.ids)
  const remove = useCompareStore((s) => s.remove)
  const clear = useCompareStore((s) => s.clear)
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[]
  if (items.length === 0) return null

  return (
    <aside className="fixed bottom-4 left-1/2 z-[90] w-[min(920px,calc(100vw-2rem))] -translate-x-1/2 border border-line bg-bg p-3 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Compare {items.length}/4
        </p>
        <button onClick={clear} className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-accent">
          Clear
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-2 border border-line/70 p-2">
            <div className="relative h-12 w-12 overflow-hidden">
              <OptimizedImage src={p.image} alt="" sizes="48px" />
            </div>
            <Link href={`/products/${p.id}`} className="min-w-0">
              <p className="truncate text-sm">{p.name}</p>
              <p className="font-mono text-[10px] text-muted">{p.kind} / {priceFmt(p.price)}</p>
            </Link>
            <button onClick={() => remove(p.id)} aria-label="Remove from comparison" className="text-muted hover:text-accent">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}
