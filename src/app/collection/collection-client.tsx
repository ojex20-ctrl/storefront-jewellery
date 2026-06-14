"use client"
import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reveal, LiveDot, Sparkles } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"
import {
  ActiveFilters,
  PriceRange,
  SortPicker,
} from "@podium/ui/chrome"
import {
  useListingFilters,
  applyFilters,
  type AxisAccessor,
} from "@podium/ui/hooks"
import { priceFmt } from "@podium/ui/lib"
import type { Kind, Metal, Stone, Product } from "@/lib/products"
import { STONE_HEX } from "@/lib/products"
import { ProductCard } from "@/components/product/product-card"

const KINDS: Kind[] = ["Ring", "Necklace", "Earrings", "Bracelet", "Nose ring"]
const METALS: Metal[] = ["18k Gold", "Sterling", "Rose Gold", "White Gold"]
const STONES: Stone[] = ["Diamond", "Sapphire", "Emerald", "Onyx", "Pearl", "None"]
const AXES = ["kind", "metal", "stone", "rentable"] as const

export function CollectionClient({ products }: { products: Product[] }) {
  const filters = useListingFilters({ axes: AXES })

  const priceBounds: [number, number] = useMemo(() => {
    if (products.length === 0) return [0, 0]
    const prices = products.map((p) => p.price)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [products])

  const accessors: Record<string, AxisAccessor<Product>> = {
    kind: (p) => p.kind,
    metal: (p) => p.metals,
    stone: (p) => p.stones,
    rentable: (p) => (p.rental?.enabled ? ["yes"] : []),
  }

  const filtered = useMemo(
    () =>
      applyFilters(products, filters, {
        accessors,
        searchText: (p) =>
          `${p.name} ${p.kind} ${p.metals.join(" ")} ${p.stones.join(" ")}`,
      }),
    [products, filters, accessors],
  )

  const counts = useMemo(() => {
    const kind: Record<string, number> = {}
    const metal: Record<string, number> = {}
    const stone: Record<string, number> = {}
    const rentable: Record<string, number> = { yes: 0 }
    for (const p of products) {
      kind[p.kind] = (kind[p.kind] ?? 0) + 1
      for (const m of p.metals) metal[m] = (metal[m] ?? 0) + 1
      for (const s of p.stones) stone[s] = (stone[s] ?? 0) + 1
      if (p.rental?.enabled) rentable.yes = (rentable.yes ?? 0) + 1
    }
    return { kind, metal, stone, rentable }
  }, [products])

  const isFacetActive = (axis: string, value: string) =>
    filters.facets[axis]?.includes(value) ?? false

  return (
    <div className="overflow-x-hidden">
      <section className="relative border-b border-line px-4 py-24 md:px-12 md:py-32">
        <Sparkles count={28} className="opacity-40" />
        <div className="relative z-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              <LiveDot />
              Collection
            </span>
            <p
              className="mt-5 font-display tracking-tighter"
              style={{ fontSize: "clamp(56px, 8vw, 132px)", lineHeight: 0.95 }}
            >
              Pieces in <em className="text-accent">circulation</em>.
            </p>
            <p className="mt-6 max-w-[560px] text-base leading-relaxed text-ink-2">
              Hand-set, hand-finished, photographed once. {filtered.length} of {products.length} pieces shown.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-[70px] z-10 border-b border-line bg-bg/85 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-12">
          <input
            type="search"
            value={filters.query}
            onChange={(e) => filters.setQuery(e.target.value)}
            placeholder="Search the collection…"
            className="w-full max-w-[320px] border border-line bg-bg px-3 py-1.5 font-mono text-[11px] outline-none focus:border-accent"
          />
          <SortPicker filters={filters} className="ml-auto" />
        </div>

        <div className="grid gap-2 border-t border-line/60 px-4 py-3 md:px-12">
          <Row label="Kind">
            {KINDS.map((k) => (
              <Pill
                key={k}
                active={isFacetActive("kind", k)}
                onClick={() => filters.toggleFacet("kind", k)}
                count={counts.kind[k]}
              >
                {k}
              </Pill>
            ))}
          </Row>
          <Row label="Metal">
            {METALS.map((m) => (
              <Pill
                key={m}
                active={isFacetActive("metal", m)}
                onClick={() => filters.toggleFacet("metal", m)}
                count={counts.metal[m]}
              >
                {m}
              </Pill>
            ))}
          </Row>
          <Row label="Stone">
            {STONES.map((s) => (
              <Pill
                key={s}
                active={isFacetActive("stone", s)}
                onClick={() => filters.toggleFacet("stone", s)}
                count={counts.stone[s]}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-line"
                  style={{ background: STONE_HEX[s] }}
                />
                {s}
              </Pill>
            ))}
          </Row>
          <Row label="Type">
            <Pill
              active={isFacetActive("rentable", "yes")}
              onClick={() => filters.toggleFacet("rentable", "yes")}
              count={counts.rentable.yes}
            >
              ★ Rentable
            </Pill>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Price
            </span>
            <PriceRange filters={filters} bounds={priceBounds} currency="AED" />
          </Row>
        </div>

        {filters.isActive && (
          <div className="border-t border-line/60 px-4 py-2 md:px-12">
            <ActiveFilters filters={filters} formatPrice={priceFmt} />
          </div>
        )}
      </section>

      <section className="px-4 py-12 md:px-12 md:py-20">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${filters.activeCount}-${filters.sort}-${filters.query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8"
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="border border-line p-20 text-center">
            <Eyebrow>Filter</Eyebrow>
            <p className="mt-3 font-display text-4xl">
              <em>No pieces match.</em>
            </p>
            <p className="mt-3 text-sm text-muted">Loosen the filter to see more.</p>
            <button
              onClick={filters.clearAll}
              className="mt-5 inline-block border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[60px] font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
    </div>
  )
}

function Pill({
  active,
  children,
  onClick,
  count,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active
          ? "border-accent bg-accent text-paper"
          : "border-line text-ink hover:border-accent hover:text-accent"
      }`}
    >
      {children}
      {typeof count === "number" && (
        <span className={active ? "text-paper/70" : "text-muted"}>{count}</span>
      )}
    </button>
  )
}
