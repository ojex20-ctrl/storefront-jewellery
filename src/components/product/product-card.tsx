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
    <div className="card group flex flex-col gap-3">
      <Link
        href={`/products/${product.id}`}
        className="flex flex-col gap-3"
      >
        <div className="product-card-media relative aspect-[3/4] overflow-hidden bg-bg-2">
          <div className="absolute right-3 top-3 z-10">
            <ProductActions productId={product.id} compact />
          </div>
          {/* Main Image */}
          <OptimizedImage
            src={product.image}
            className={`product-card-image-main object-cover transition-all duration-300 ${product.gallery[1] ? 'group-hover:opacity-0' : ''}`}
            alt={product.name}
          />
          
          {/* Hover Image (Instant Swap) */}
          {product.gallery[1] && (
            <div className="product-card-hover-image absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <OptimizedImage src={product.gallery[1]} alt={`${product.name} alternate view`} />
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
          <p className="font-display text-lg tracking-tight leading-tight">
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
        className="w-full bg-accent text-bg py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider"
      >
        Add to Cart
      </button>
    </div>
  )
}
