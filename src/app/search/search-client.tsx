"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent } from "react"
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react"
import { Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { ProductCard } from "@/components/product/product-card"
import type { Product } from "@/lib/products"

type SortKey = "relevance" | "newest" | "price_low" | "price_high"

export function SearchClient({
  products,
  initialQuery,
}: {
  products: Product[]
  initialQuery: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [kind, setKind] = useState("all")
  const [sort, setSort] = useState<SortKey>("relevance")

  const kinds = useMemo(
    () => Array.from(new Set(products.map((product) => product.kind))).sort(),
    [products],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const byText = normalized
      ? products.filter((product) => productText(product).includes(normalized))
      : products
    const byKind = kind === "all" ? byText : byText.filter((product) => product.kind === kind)
    return [...byKind].sort((a, b) => {
      if (sort === "price_low") return a.price - b.price
      if (sort === "price_high") return b.price - a.price
      if (sort === "newest") return (b.tag === "NEW" ? 1 : 0) - (a.tag === "NEW" ? 1 : 0)
      return relevanceScore(b, normalized) - relevanceScore(a, normalized)
    })
  }, [kind, products, query, sort])

  const featuredKinds = kinds.slice(0, 5)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = query.trim()
    router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search")
  }

  return (
    <div className="bg-bg text-ink">
      <section className="border-b border-line px-4 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-[1400px]">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
            Home
          </Link>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <Eyebrow className="mb-3 block">Search</Eyebrow>
              <h1 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
                Find the right piece faster.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
                Search by product name, category, finish, stone, collection, or styling note.
              </p>
            </div>
            <div className="grid grid-cols-3 border border-line">
              <Metric label="Pieces" value={String(products.length)} />
              <Metric label="Shown" value={String(filtered.length)} />
              <Metric label="From" value={products.length ? priceFmt(Math.min(...products.map((p) => p.price))) : "-"} />
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[70px] z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 md:px-12">
          <form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px]">
            <label className="flex items-center gap-3 border border-line bg-paper px-4 py-3 focus-within:border-accent">
              <Search className="h-4 w-4 text-muted" strokeWidth={1.6} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rings, pearl, anti-tarnish..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-muted hover:text-ink">
                  <X className="h-4 w-4" strokeWidth={1.6} />
                </button>
              )}
            </label>
            <label className="flex items-center gap-2 border border-line bg-paper px-3 py-3">
              <SlidersHorizontal className="h-4 w-4 text-muted" strokeWidth={1.6} />
              <select value={kind} onChange={(event) => setKind(event.target.value)} className="w-full bg-transparent text-sm outline-none">
                <option value="all">All categories</option>
                {kinds.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="border border-line bg-paper px-3 py-3 text-sm outline-none focus:border-accent">
              <option value="relevance">Relevance</option>
              <option value="newest">New in first</option>
              <option value="price_low">Price low to high</option>
              <option value="price_high">Price high to low</option>
            </select>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setKind("all")}
              className={`shrink-0 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${kind === "all" ? "border-accent bg-accent text-bg" : "border-line text-muted hover:text-ink"}`}
            >
              All
            </button>
            {featuredKinds.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setKind(item)}
                className={`shrink-0 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest ${kind === item ? "border-accent bg-accent text-bg" : "border-line text-muted hover:text-ink"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-12 md:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-2 block">{query.trim() ? "Results" : "Browse"}</Eyebrow>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">
              {query.trim() ? `Results for "${query.trim()}"` : "Explore the catalogue"}
            </h2>
          </div>
          <Link href="/collection" className="font-mono text-[11px] uppercase tracking-widest text-accent hover:underline">
            Advanced collection filters
          </Link>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 xl:grid-cols-5">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="border border-line px-6 py-16 text-center">
            <Eyebrow>Nothing found</Eyebrow>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Try a shorter search term or browse the full collection.
            </p>
            <Link href="/collection" className="mt-6 inline-flex border border-line px-5 py-3 font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent">
              Shop all
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-line p-4 last:border-r-0">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  )
}

function productText(product: Product) {
  return [
    product.name,
    product.kind,
    product.subcategory,
    product.caption,
    product.desc,
    product.material,
    ...(product.metals ?? []),
    ...(product.stones ?? []),
    ...(product.tags ?? []),
    ...(product.subHierarchies ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function relevanceScore(product: Product, query: string) {
  if (!query) return product.tag === "NEW" ? 1 : 0
  const name = product.name.toLowerCase()
  if (name === query) return 5
  if (name.startsWith(query)) return 4
  if (name.includes(query)) return 3
  return productText(product).includes(query) ? 1 : 0
}
