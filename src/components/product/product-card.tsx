"use client"
import Link from "next/link"
import { Placeholder } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import type { Product } from "@/lib/products"

type Props = { product: Product; index?: number }

/**
 * ZIORA card — replaces clothing's swatch row with a stone-chip strip.
 * Hover: image scales 4%, gold underline grows under the title, shadow lifts.
 */
export function ProductCard({ product, index = 0 }: Props) {
  const tint = (((index % 5) + 1) as 1 | 2 | 3 | 4 | 5)
  return (
    <div className="card group flex flex-col gap-3">
      <Link
        href={`/products/${product.id}`}
        className="flex flex-col gap-3"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-bg-2">
          {/* Main Image */}
          <Placeholder
            image={product.image}
            tint={tint}
            className={`h-full w-full transition-opacity duration-300 ${product.gallery[1] ? 'group-hover:opacity-0' : ''}`}
            alt={product.name}
          />
          
          {/* Hover Image (Instant Swap) */}
          {product.gallery[1] && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Placeholder
                image={product.gallery[1]}
                tint={tint}
                className="h-full w-full"
                alt={`${product.name} alternate view`}
              />
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
      <button className="w-full bg-accent text-bg py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider">
        Add to Cart
      </button>
    </div>
  )
}
