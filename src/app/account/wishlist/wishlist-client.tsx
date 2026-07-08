"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Eyebrow, Button } from "@podium/ui/primitives"
import { useWishlistStore } from "@/stores/wishlist-store"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/products"

export function WishlistClient({ products }: { products: Product[] }) {
  const ids = useWishlistStore((s) => s.ids)
  const clear = useWishlistStore((s) => s.clear)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
    void fetch("/api/account/wishlist", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.ids) return
        clear()
        for (const id of data.ids as string[]) useWishlistStore.getState().toggle(id)
      })
      .catch(() => {})
  }, [clear])
  useEffect(() => {
    if (!hydrated) return
    void fetch("/api/account/wishlist", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids }),
    }).catch(() => {})
  }, [hydrated, ids])
  const items = hydrated ? products.filter((p) => ids.includes(p.id)) : []
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 md:px-8 md:py-20">
      <Eyebrow className="mb-3 block">Account · Wishlist</Eyebrow>
      <h1 className="mb-10 font-display tracking-tighter" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
        Saved <em className="text-accent">pieces</em>.
      </h1>
      <Link href="/account" className="ulink mb-8 inline-block font-mono text-[11px] uppercase tracking-widest text-muted">
        ← Back to account
      </Link>
      {hydrated && items.length === 0 ? (
        <div className="border border-line p-14 text-center">
          <p className="mb-2 font-display text-4xl">
            <em>Nothing saved yet.</em>
          </p>
          <Eyebrow className="mb-6 block">Tap the heart on any piece to add it</Eyebrow>
          <Link href="/collection">
            <Button>Shop the collection</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
