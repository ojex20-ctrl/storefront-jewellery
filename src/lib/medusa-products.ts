/**
 * Product fetchers — reads from local SQLite database via Prisma.
 * Falls back to mock data if database is empty.
 */

import "server-only"
import type { Product } from "./products"
import { prisma } from "./db"
import { MOCK_PRODUCTS } from "./mock-data"

function dbToProduct(p: {
  id: string; name: string; slug: string; kind: string; caption: string; description: string
  price: number; compareAtPrice: number | null; metals: string; stones: string; sizes: string
  tag: string | null; image: string; gallery: string; modelImages: string; bundleIds: string
  weight: number | null; material: string | null; warranty: string | null
  published: boolean; featured: boolean
}): Product {
  return {
    id: p.slug,
    name: p.name,
    kind: p.kind as Product["kind"],
    caption: p.caption,
    price: p.price,
    metals: JSON.parse(p.metals),
    stones: JSON.parse(p.stones),
    sizes: JSON.parse(p.sizes),
    tag: (p.tag as Product["tag"]) ?? undefined,
    image: p.image,
    gallery: JSON.parse(p.gallery).length > 0 ? JSON.parse(p.gallery) : [p.image],
    desc: p.description,
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] },
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    })
    if (products.length > 0) return products.map(dbToProduct)
  } catch {
    // DB not available — fall through to mock
  }
  return MOCK_PRODUCTS
}

export async function fetchProduct(handle: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findUnique({ where: { slug: handle } })
    if (p && p.published) return dbToProduct(p)
  } catch {
    // DB not available
  }
  return MOCK_PRODUCTS.find((m) => m.id === handle) ?? MOCK_PRODUCTS[0] ?? null
}

export async function fetchFeatured(n = 6): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { published: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: n,
    })
    if (products.length > 0) return products.map(dbToProduct)
  } catch {
    // fall through
  }
  return MOCK_PRODUCTS.slice(0, n)
}
