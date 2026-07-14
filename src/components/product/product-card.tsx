"use client"
import Link from "next/link"
import { priceFmt } from "@podium/ui/lib"
import { toast } from "sonner"
import { ProductActions } from "@/components/commerce/product-actions"
import { useCartStore } from "@/stores/cart-store"
import { toCartLine, type Product } from "@/lib/products"
import { OptimizedImage } from "@/components/media/optimized-image"

type Props = { product: Product; index?: number }

/**
 * ZIORA card — replaces clothing's swatch row with a stone-chip strip.
 * Hover: image scales 4%, gold underline grows under the title, shadow lifts.
 */
export function ProductCard({ product, index = 0 }: Props) {
  const add = useCartStore((s) => s.add)
  const defaultMetal = product.metals[0] ?? "Sterling"
  const defaultStone = product.stones[0] ?? "None"
  const defaultSize = product.sizes[0] ?? null

  return (
    <div className="card group relative flex flex-col gap-3 transition-transform duration-500 hover:-translate-y-1">
      <Link
        href={`/products/${product.id}`}
        className="flex flex-col gap-3"
      >
        <div className="product-card-media relative isolate aspect-[3/4] overflow-hidden border border-line/70 bg-bg-2 shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-500 group-hover:border-accent/80 group-hover:shadow-[0_22px_70px_rgba(194,185,167,0.16)]">
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(to_top,rgba(0,0,0,0.28),transparent_48%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="pointer-events-none absolute -left-1/2 top-0 z-[2] h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 blur-sm transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100" />
          <span className="pointer-events-none absolute left-4 top-1/2 z-[2] h-1.5 w-1.5 rounded-full bg-accent/70 opacity-0 shadow-[0_0_18px_rgba(194,185,167,0.8)] transition-all duration-700 group-hover:top-[18%] group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-8 right-5 z-[2] h-1 w-1 rounded-full bg-white/80 opacity-0 shadow-[0_0_16px_rgba(255,255,255,0.75)] transition-all duration-700 group-hover:bottom-16 group-hover:opacity-100" />
          <div className="absolute right-3 top-3 z-10">
            <ProductActions productId={product.id} compact />
          </div>
          {/* Main Image */}
          <OptimizedImage
            src={product.image}
            className={`product-card-image-main object-cover transition-all duration-700 group-hover:scale-[1.055] group-hover:saturate-[1.12] ${product.gallery[1] ? 'group-hover:opacity-0' : ''}`}
            alt={product.name}
          />
          
          {/* Hover Image (Instant Swap) */}
          {product.gallery[1] && (
            <div className="product-card-hover-image absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <OptimizedImage src={product.gallery[1]} alt={`${product.name} alternate view`} className="object-cover transition-transform duration-700 group-hover:scale-[1.055]" />
            </div>
          )}

          {product.tag && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-accent text-bg px-3 py-1 text-[10px] uppercase font-bold tracking-wider">
                {product.tag}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 px-1">
          <p className="font-display text-lg tracking-tight leading-tight transition-colors duration-300 group-hover:text-accent">
            {product.name}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {priceFmt(product.price)}
          </p>
        </div>
      </Link>
      <button
        onClick={() => {
          add(toCartLine(product, defaultMetal, defaultStone, defaultSize))
          toast.success(`${product.name} added to bag`)
        }}
        className="relative w-full overflow-hidden rounded-lg bg-accent py-3 text-[11px] font-bold uppercase tracking-wider text-bg transition-transform duration-300 hover:-translate-y-0.5 before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:-skew-x-12 before:bg-white/25 before:transition-all before:duration-700 hover:before:left-[125%]"
      >
        <span className="relative">Add to Cart</span>
      </button>
    </div>
  )
}
