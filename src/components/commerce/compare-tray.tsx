"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { GitCompare, X } from "lucide-react"
import { priceFmt } from "@podium/ui/lib"
import { useCompareStore } from "@/stores/compare-store"
import type { Product } from "@/lib/products"
import { OptimizedImage } from "@/components/media/optimized-image"

const compareRows = [
  { label: "Category", value: (p: Product) => p.kind },
  { label: "Price", value: (p: Product) => priceFmt(p.price) },
  { label: "Compare price", value: (p: Product) => p.compareAtPrice && p.compareAtPrice > p.price ? priceFmt(p.compareAtPrice) : "-" },
  { label: "Metal", value: (p: Product) => formatList(p.metals) },
  { label: "Stone", value: (p: Product) => formatList(p.stones) },
  { label: "Sizes", value: (p: Product) => formatList(p.sizes) },
  { label: "Material", value: (p: Product) => p.material || "Not specified" },
  { label: "Warranty", value: (p: Product) => p.warranty || "Standard warranty" },
  { label: "Status", value: (p: Product) => p.tag === "OUT OF STOCK" ? "Out of stock" : p.tag || "Available" },
]

export function CompareTray({ products }: { products: Product[] }) {
  const ids = useCompareStore((s) => s.ids)
  const remove = useCompareStore((s) => s.remove)
  const clear = useCompareStore((s) => s.clear)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const items = useMemo(
    () => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
    [ids, products],
  )
  const canCompare = items.length >= 2
  const hidden = Boolean(
    pathname?.startsWith("/admin") ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname?.startsWith("/confirmation") ||
    pathname?.startsWith("/payment-failed"),
  )

  useEffect(() => {
    if (!canCompare || hidden) setOpen(false)
  }, [canCompare, hidden])

  if (hidden || items.length === 0) return null

  return (
    <>
      <aside className="fixed bottom-4 left-1/2 z-[90] w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 border border-line bg-bg p-3 shadow-2xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Compare {items.length}/4
            </p>
            <p className="mt-1 text-xs text-muted">
              {canCompare ? "Ready to compare selected jewellery." : "Add one more product to compare."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={!canCompare}
              className="inline-flex h-10 items-center gap-2 border border-accent bg-accent px-4 font-mono text-[10px] uppercase tracking-widest text-bg transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:border-line disabled:bg-paper disabled:text-muted disabled:opacity-70"
            >
              <GitCompare className="h-3.5 w-3.5" strokeWidth={1.7} />
              Compare selected
            </button>
            <button type="button" onClick={clear} className="h-10 border border-line px-3 font-mono text-[10px] uppercase tracking-widest text-muted hover:border-accent hover:text-accent">
              Clear
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-2 border border-line/70 p-2">
              <div className="relative h-12 w-12 overflow-hidden bg-bg-2">
                <OptimizedImage src={p.image} alt="" sizes="48px" />
              </div>
              <Link href={`/products/${p.id}`} className="min-w-0">
                <p className="truncate text-sm text-ink">{p.name}</p>
                <p className="font-mono text-[10px] text-muted">{p.kind} / {priceFmt(p.price)}</p>
              </Link>
              <button type="button" onClick={() => remove(p.id)} aria-label="Remove from comparison" className="text-muted hover:text-accent">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-[110] bg-black/65 px-3 py-6 backdrop-blur-sm md:px-6" onClick={() => setOpen(false)}>
          <div className="mx-auto flex max-h-[calc(100vh-3rem)] max-w-[1180px] flex-col overflow-hidden border border-line bg-bg text-ink shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-line px-4 py-4 md:px-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Product comparison</p>
                <h2 className="mt-1 font-display text-3xl leading-none md:text-4xl">Compare selected pieces</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close comparison" className="grid h-10 w-10 shrink-0 place-items-center border border-line text-muted hover:border-accent hover:text-accent">
                <X className="h-4 w-4" strokeWidth={1.7} />
              </button>
            </div>

            <div className="overflow-auto p-4 md:p-6">
              <div className="min-w-[720px]">
                <div className="grid gap-3" style={{ gridTemplateColumns: `150px repeat(${items.length}, minmax(170px, 1fr))` }}>
                  <div />
                  {items.map((p) => (
                    <div key={p.id} className="border border-line bg-paper p-3">
                      <div className="relative mb-3 aspect-square overflow-hidden bg-bg-2">
                        <OptimizedImage src={p.image} alt={p.name} sizes="180px" className="object-cover" />
                      </div>
                      <Link href={`/products/${p.id}`} className="block font-display text-xl leading-tight text-ink hover:text-accent">
                        {p.name}
                      </Link>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">{priceFmt(p.price)}</p>
                    </div>
                  ))}

                  {compareRows.map((row) => (
                    <CompareRow key={row.label} label={row.label} values={items.map(row.value)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <>
      <div className="border-t border-line py-3 font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </div>
      {values.map((value, index) => (
        <div key={`${label}-${index}`} className="border-t border-line px-3 py-3 text-sm leading-5 text-ink">
          {value}
        </div>
      ))}
    </>
  )
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-"
}
