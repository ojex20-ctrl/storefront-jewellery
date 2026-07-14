import { notFound } from "next/navigation"
import Link from "next/link"
import { CollectionClient } from "../collection-client"
import { fetchProducts } from "@/lib/medusa-products"
import type { Product } from "@/lib/products"

type Params = Promise<{ category: string }>

type CategoryDef = { title: string; eyebrow: string; tagline: string; match: (p: Product) => boolean }

const CATEGORIES: Record<string, CategoryDef> = {
  rings: {
    title: "Rings",
    eyebrow: "The ring edit",
    tagline: "Stackable bands, bold statements, and everyday solitaires — anti-tarnish, made to be worn for life.",
    match: (p) => p.kind === "Ring",
  },
  earrings: {
    title: "Earrings",
    eyebrow: "The earring edit",
    tagline: "Studs, hoops, huggies and drops that hold their shine — waterproof and skin-friendly.",
    match: (p) => p.kind === "Earrings",
  },
  necklaces: {
    title: "Necklaces",
    eyebrow: "The necklace edit",
    tagline: "Layered chains, chokers and pendants engineered to never tarnish.",
    match: (p) => p.kind === "Necklace",
  },
  bracelets: {
    title: "Bracelets",
    eyebrow: "The bracelet edit",
    tagline: "Cuffs, tennis chains and charms for the wrist — sweat-proof and daily-wear ready.",
    match: (p) => p.kind === "Bracelet",
  },
  "best-sellers": {
    title: "Best Sellers",
    eyebrow: "Loved by everyone",
    tagline: "The pieces our community reaches for again and again.",
    match: (p) =>
      p.tag === "BESTSELLER" ||
      (p.mainHierarchies ?? []).includes("Best Sellers") ||
      (p.tags ?? []).some((t) => /best|trend/i.test(t)),
  },
}

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }))
}

export async function generateMetadata({ params }: { params: Params }) {
  const { category } = await params
  const def = CATEGORIES[category]
  if (!def) return { title: "Collection" }
  return {
    title: `${def.title} — SYRA`,
    description: def.tagline,
    alternates: { canonical: `/collection/${category}` },
    openGraph: { title: `${def.title} — SYRA`, description: def.tagline, type: "website" as const },
  }
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params
  const def = CATEGORIES[category]
  if (!def) notFound()

  const all = await fetchProducts()
  const products = all.filter(def.match)

  return (
    <div>
      {/* Category hero */}
      <section className="relative overflow-hidden border-b border-line px-4 py-20 text-center md:px-8 md:py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(600px 340px at 50% 0%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[720px]">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{def.eyebrow}</p>
          <h1 className="font-display tracking-tighter" style={{ fontSize: "clamp(56px, 10vw, 128px)", lineHeight: 0.92 }}>
            {def.title}
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-sm leading-relaxed text-muted md:text-base">{def.tagline}</p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted">
            {products.length} {products.length === 1 ? "piece" : "pieces"} ·{" "}
            <Link href="/collection" className="underline hover:text-ink">View all jewellery</Link>
          </p>
        </div>
      </section>

      {products.length > 0 ? (
        <CollectionClient products={products} showHero={false} />
      ) : (
        <div className="px-4 py-24 text-center text-muted">
          <p className="mb-4 font-display text-3xl text-ink">Nothing here yet.</p>
          <Link href="/collection" className="underline">Explore the full collection →</Link>
        </div>
      )}
    </div>
  )
}
