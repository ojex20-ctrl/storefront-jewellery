"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { Placeholder, TagSticker, Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { preloadModel } from "@podium/ui/3d"
import type { Product } from "@/lib/products"
import { STONE_HEX } from "@/lib/products"

const tagVariant = {
  NEW: "new",
  BESTSELLER: "default",
  "LOW STOCK": "low",
  "ONE OF ONE": "hot",
} as const

type Props = { product: Product; index?: number }

/**
 * ZIORA card — replaces clothing's swatch row with a stone-chip strip.
 * Hover: image scales 4%, gold underline grows under the title, shadow lifts.
 */
export function ProductCard({ product, index = 0 }: Props) {
  const tint = (((index % 5) + 1) as 1 | 2 | 3 | 4 | 5)
  return (
    <Link
      href={`/products/${product.id}`}
      className="card group flex flex-col gap-4"
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
          <div className="absolute left-4 top-4">
            <TagSticker variant={tagVariant[product.tag] ?? "default"}>
              {product.tag}
            </TagSticker>
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
  )
}
