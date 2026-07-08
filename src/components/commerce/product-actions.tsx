"use client"
import { GitCompare, Heart } from "lucide-react"
import { toast } from "sonner"
import { useCompareStore } from "@/stores/compare-store"
import { useWishlistStore } from "@/stores/wishlist-store"

export function ProductActions({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const wishlistHas = useWishlistStore((s) => s.has(productId))
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const compareHas = useCompareStore((s) => s.has(productId))
  const toggleCompare = useCompareStore((s) => s.toggle)

  return (
    <div className={compact ? "flex gap-1.5" : "flex gap-2"}>
      <button
        type="button"
        aria-label={wishlistHas ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWishlist(productId)
          toast.success(wishlistHas ? "Removed from wishlist" : "Saved to wishlist")
        }}
        className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
          wishlistHas ? "border-accent bg-accent text-bg" : "border-line bg-bg/85 text-ink hover:border-accent"
        }`}
      >
        <Heart size={16} fill={wishlistHas ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        aria-label={compareHas ? "Remove from comparison" : "Add to comparison"}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleCompare(productId)
          toast.success(compareHas ? "Removed from compare" : "Added to compare")
        }}
        className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
          compareHas ? "border-accent bg-accent text-bg" : "border-line bg-bg/85 text-ink hover:border-accent"
        }`}
      >
        <GitCompare size={15} />
      </button>
    </div>
  )
}
