"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { toCartLine, type Metal, type Product, type Stone } from "@/lib/products"
import { OptimizedImage } from "@/components/media/optimized-image"

export function StickyAddToCart({
  product,
  metal,
  stone,
  size,
  disabled = false,
}: {
  product: Product
  metal: Metal
  stone: Stone
  size: string | null
  disabled?: boolean
}) {
  const add = useCartStore((s) => s.add)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] border-t border-line bg-paper/95 px-4 py-3 text-ink shadow-[0_-12px_30px_rgba(0,0,0,0.12)] backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center gap-3">
        <div className="relative h-12 w-10 overflow-hidden">
          <OptimizedImage src={product.image} alt="" sizes="40px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="font-mono text-[11px] text-muted">{priceFmt(product.price)}</p>
        </div>
        <button
          onClick={() => {
            if (disabled) return
            if (product.sizes.length > 0 && !size) {
              toast.error("Choose a size")
              return
            }
            add(toCartLine(product, metal, stone, size))
            toast.success(`${product.name} added to bag`)
          }}
          disabled={disabled}
          className="rounded-full bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-widest text-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  )
}
