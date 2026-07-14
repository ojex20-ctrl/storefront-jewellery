"use client"
import { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Eyebrow } from "@podium/ui/primitives"
import { ActiveFilters, SortPicker } from "@podium/ui/chrome"
import {
  useListingFilters,
  applyFilters,
  type AxisAccessor,
} from "@podium/ui/hooks"
import { priceFmt } from "@podium/ui/lib"
import type { Kind, Metal, Stone, Product } from "@/lib/products"
import { STONE_HEX } from "@/lib/products"
import { ProductCard } from "@/components/product/product-card"
import { OptimizedImage } from "@/components/media/optimized-image"
import { JsonLd } from "@/components/seo/json-ld"
import { collectionJsonLd } from "@/lib/seo-jsonld"

const KINDS: Kind[] = ["Ring", "Necklace", "Earrings", "Bracelet", "Nose ring"]
const METALS: Metal[] = ["18k Gold", "Sterling", "Rose Gold", "White Gold"]
const STONES: Stone[] = ["Diamond", "Sapphire", "Emerald", "Onyx", "Pearl", "None"]
const AXES = ["kind", "subcategory", "metal", "stone", "collection", "rentable"] as const

type HeroCopy = { eyebrow: string; title: string; body: string; fallbackImage: string }

const DEFAULT_HERO: HeroCopy = {
  eyebrow: "Collection",
  title: "Anti-tarnish pieces for every day.",
  body: "Explore rings, earrings, necklaces and bracelets designed to hold their finish through daily wear.",
  fallbackImage: "/hero/syra_hero_1.png",
}

const KIND_HERO: Record<Kind, HeroCopy> = {
  Ring: {
    eyebrow: "The ring edit",
    title: "Rings made to stack, shine, and stay polished.",
    body: "From slim daily bands to crystal statements, explore anti-tarnish rings for every hand and every mood.",
    fallbackImage: "/hero/syra_banner_rings.png",
  },
  Necklace: {
    eyebrow: "The necklace edit",
    title: "Necklaces that layer cleanly and hold their glow.",
    body: "Discover chains, pendants, and layered pieces with waterproof finishes and easy everyday styling.",
    fallbackImage: "/jewellery/gen-gold-necklace.png",
  },
  Earrings: {
    eyebrow: "The earring edit",
    title: "Earrings for soft sparkle, strong shine, and daily wear.",
    body: "Shop studs, hoops, huggies, and drops designed to feel light, skin-friendly, and polished all day.",
    fallbackImage: "/hero/syra_banner_earrings.png",
  },
  Bracelet: {
    eyebrow: "The bracelet edit",
    title: "Bracelets with movement, shine, and an easy fit.",
    body: "Explore cuffs, tennis bracelets, bangles, and delicate stacks finished for sweat-proof daily wear.",
    fallbackImage: "/hero/syra_banner_bracelets.png",
  },
  "Nose ring": {
    eyebrow: "The nose ring edit",
    title: "Nose rings with a polished, delicate finish.",
    body: "Minimal hoops and refined accents made for comfortable wear and a clean everyday look.",
    fallbackImage: "/jewellery/gen-pink-heart-ring.png",
  },
}

type CollectionClientProps = {
  products: Product[]
  showHero?: boolean
}

export function CollectionClient({ products, showHero = true }: CollectionClientProps) {
  const filters = useListingFilters({ axes: AXES })

  const priceBounds: [number, number] = useMemo(() => {
    if (products.length === 0) return [0, 0]
    const prices = products.map((p) => p.price)
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]
  }, [products])

  const filtered = useMemo(() => {
    const accessors: Record<string, AxisAccessor<Product>> = {
      kind: (p) => p.kind,
      subcategory: (p) => p.subcategory ? [p.subcategory] : [],
      metal: (p) => p.metals,
      stone: (p) => p.stones,
      collection: (p) => p.subHierarchies ?? [],
      rentable: (p) => (p.rental?.enabled ? ["yes"] : []),
    }

    return applyFilters(products, filters, {
      accessors,
      searchText: (p) =>
        `${p.name} ${p.kind} ${p.metals.join(" ")} ${p.stones.join(" ")} ${(p.tags ?? []).join(" ")}`,
    })
  }, [products, filters])

  const counts = useMemo(() => {
    const kind: Record<string, number> = {}
    const metal: Record<string, number> = {}
    const stone: Record<string, number> = {}
    const collection: Record<string, number> = {}
    const rentable: Record<string, number> = { yes: 0 }
    for (const p of products) {
      kind[p.kind] = (kind[p.kind] ?? 0) + 1
      for (const m of p.metals) metal[m] = (metal[m] ?? 0) + 1
      for (const s of p.stones) stone[s] = (stone[s] ?? 0) + 1
      for (const c of p.subHierarchies ?? []) collection[c] = (collection[c] ?? 0) + 1
      if (p.rental?.enabled) rentable.yes = (rentable.yes ?? 0) + 1
    }
    return { kind, metal, stone, collection, rentable }
  }, [products])

  const isFacetActive = (axis: string, value: string) =>
    filters.facets[axis]?.includes(value) ?? false

  const activeKinds = (filters.facets.kind ?? []).filter((kind): kind is Kind => KINDS.includes(kind as Kind))
  const activeKind = activeKinds.length === 1 ? activeKinds[0] : null
  const heroCopy = activeKind ? KIND_HERO[activeKind] : DEFAULT_HERO
  const heroPool = activeKind
    ? (filtered.length > 0 ? filtered : products.filter((p) => p.kind === activeKind))
    : (filtered.length > 0 ? filtered : products)
  const heroProduct = heroPool.find((p) => p.image) ?? products.find((p) => p.image) ?? products[0]
  const heroImage = heroProduct?.image || heroCopy.fallbackImage
  const heroAlt = heroProduct?.name ?? heroCopy.title
  const availableKinds = KINDS.filter((k) => counts.kind[k])
  const availableMetals = METALS.filter((m) => counts.metal[m])
  const availableStones = STONES.filter((s) => counts.stone[s])
  const collectionNames = Object.keys(counts.collection).sort()

  return (
    <div className="overflow-x-hidden bg-bg text-ink">
      <JsonLd data={collectionJsonLd(products)} />

      {showHero && (
        <section className="relative overflow-hidden border-b border-line px-4 py-16 md:px-12 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "radial-gradient(760px 420px at 18% 8%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 72%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
            <div>
              <Eyebrow className="mb-4 block text-accent">{heroCopy.eyebrow}</Eyebrow>
              <h1 className="max-w-[920px] font-display leading-[0.92] tracking-tight" style={{ fontSize: "clamp(52px, 9vw, 136px)" }}>
                {heroCopy.title}
              </h1>
              <p className="mt-6 max-w-[640px] text-sm leading-relaxed text-muted md:text-base">
                {heroCopy.body}
              </p>
              <div className="mt-9 grid max-w-[760px] grid-cols-3 border-y border-line text-center md:text-left">
                <Metric label="Pieces" value={products.length} />
                <Metric label="Shown" value={filtered.length} />
                <Metric label="Finishes" value={availableMetals.length} />
              </div>
            </div>

            <div className="border border-line bg-paper p-4 shadow-2xl md:p-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-bg-2">
                <OptimizedImage
                  src={heroImage}
                  alt={heroAlt}
                  sizes="(max-width: 1024px) 100vw, 390px"
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                  <p className="font-display text-2xl leading-tight">{heroProduct?.name ?? "SYRA jewellery"}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/70">
                    {heroProduct ? `${formatKind(heroProduct.kind)} / ${priceFmt(heroProduct.price)}` : "Waterproof finish"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="sticky top-0 z-20 border-b border-line bg-bg/92 backdrop-blur md:top-[68px]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-12">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.6} />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => filters.setQuery(e.target.value)}
              placeholder="Search within collection"
              className="h-11 w-full border border-line bg-paper pl-10 pr-3 font-mono text-[11px] uppercase tracking-widest text-ink outline-none placeholder:text-muted focus:border-accent md:max-w-[420px]"
            />
          </div>
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />
              {filtered.length} / {products.length}
            </div>
            <SortPicker filters={filters} />
            {filters.isActive && (
              <button
                type="button"
                onClick={filters.clearAll}
                className="inline-flex h-10 items-center gap-2 border border-line px-3 font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.6} />
                Clear
              </button>
            )}
          </div>
        </div>
        {filters.isActive && (
          <div className="border-t border-line/70 px-4 py-2 md:px-12">
            <div className="mx-auto max-w-[1480px]">
              <ActiveFilters filters={filters} formatPrice={priceFmt} />
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-[1480px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-bg px-4 py-5 lg:sticky lg:top-[125px] lg:max-h-[calc(100vh-125px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
          <div className="mb-5 flex items-center justify-between">
            <Eyebrow>Filters</Eyebrow>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{filters.activeCount} active</span>
          </div>

          <FilterGroup label="Category">
            {availableKinds.map((k) => (
              <Pill key={k} active={isFacetActive("kind", k)} onClick={() => filters.toggleFacet("kind", k)} count={counts.kind[k]}>
                {formatKind(k)}
              </Pill>
            ))}
          </FilterGroup>

          <FilterGroup label="Price">
            <div className="grid grid-cols-2 gap-2">
              <PriceInput label="Min" value={filters.price[0]} onChange={(value) => filters.setPrice([value, filters.price[1]])} />
              <PriceInput label="Max" value={filters.price[1]} onChange={(value) => filters.setPrice([filters.price[0], value])} />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              Range {priceFmt(priceBounds[0])} - {priceFmt(priceBounds[1])}
            </p>
          </FilterGroup>

          <FilterGroup label="Metal">
            {availableMetals.map((m) => (
              <Pill key={m} active={isFacetActive("metal", m)} onClick={() => filters.toggleFacet("metal", m)} count={counts.metal[m]}>
                {m}
              </Pill>
            ))}
          </FilterGroup>

          <FilterGroup label="Stone">
            {availableStones.map((s) => (
              <Pill key={s} active={isFacetActive("stone", s)} onClick={() => filters.toggleFacet("stone", s)} count={counts.stone[s]}>
                <span className="h-2.5 w-2.5 rounded-full border border-line" style={{ background: STONE_HEX[s] }} />
                {s}
              </Pill>
            ))}
          </FilterGroup>

          {collectionNames.length > 0 && (
            <FilterGroup label="Edit">
              {collectionNames.map((c) => (
                <Pill key={c} active={isFacetActive("collection", c)} onClick={() => filters.toggleFacet("collection", c)} count={counts.collection[c]}>
                  {c}
                </Pill>
              ))}
            </FilterGroup>
          )}
        </aside>

        <div className="px-4 py-8 md:px-8 md:py-10 lg:px-10">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${filters.activeCount}-${filters.sort}-${filters.query}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            >
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <ProductCard product={p} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="border border-line bg-paper p-10 text-center md:p-16">
              <Eyebrow>Filter</Eyebrow>
              <p className="mt-3 font-display text-4xl"><em>No pieces match.</em></p>
              <p className="mt-3 text-sm text-muted">Loosen the filters or clear the search query.</p>
              <button
                onClick={filters.clearAll}
                className="mt-6 inline-flex items-center justify-center border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-accent hover:text-accent"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-line px-3 py-4 last:border-r-0 md:px-5">
      <p className="font-display text-3xl leading-none md:text-4xl">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
    </div>
  )
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <label className="block border border-line bg-paper px-3 py-2">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input
        type="number"
        min={0}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="mt-1 w-full bg-transparent font-mono text-[12px] text-ink outline-none placeholder:text-muted"
      />
    </label>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">{children}</div>
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
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-between gap-2 border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active
          ? "border-accent bg-accent text-bg"
          : "border-line bg-paper text-ink hover:border-accent hover:text-accent"
      }`}
    >
      <span className="inline-flex min-w-0 items-center gap-2 truncate">{children}</span>
      {typeof count === "number" && (
        <span className={active ? "text-bg/70" : "text-muted"}>{count}</span>
      )}
    </button>
  )
}

function formatKind(kind: Kind) {
  return kind === "Nose ring" ? "Nose Rings" : kind
}
