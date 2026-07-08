/**
 * Product fetchers — reads from local SQLite database via Prisma.
 * Falls back to mock data if database is empty.
 */

import "server-only"
import type { Product } from "./products"
import { prisma } from "./db"
import { MOCK_PRODUCTS } from "./mock-data"

import { Product as DbProduct } from "@prisma/client"

function dbToProduct(p: DbProduct): Product {
  const images = p.images ? JSON.parse(p.images) : (p.image ? [p.image] : [])
  const mainHierarchies = p.mainHierarchies ? JSON.parse(p.mainHierarchies) : (p.mainHierarchy ? [p.mainHierarchy] : [])
  const subHierarchies = p.subHierarchies ? JSON.parse(p.subHierarchies) : (p.subHierarchy ? [p.subHierarchy] : [])
  const kinds = p.kinds ? JSON.parse(p.kinds) : (p.kind ? [p.kind] : [])
  const ringTypes = p.ringType ? JSON.parse(p.ringType) : []
  const tags = p.tags ? JSON.parse(p.tags) : (p.tag ? [p.tag] : [])

  return {
    id: p.slug,
    name: p.name,
    kind: (kinds[0] as Product["kind"]) || (p.kind as Product["kind"]) || "Ring",
    subcategory: p.subcategory ?? undefined,
    caption: p.caption,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    metals: JSON.parse(p.metals),
    stones: JSON.parse(p.stones),
    sizes: JSON.parse(p.sizes),
    tag: (tags[0] as Product["tag"]) || (p.tag as Product["tag"]) || undefined,
    image: images[0] || p.image || "",
    gallery: JSON.parse(p.gallery).length > 0 ? JSON.parse(p.gallery) : (images.length > 0 ? images : [p.image]),
    desc: p.description,
    material: p.material,
    warranty: p.warranty,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    mainHierarchy: mainHierarchies[0] || p.mainHierarchy || undefined,
    subHierarchy: subHierarchies[0] || p.subHierarchy || undefined,
    rental: { enabled: false, daily_rate: 0, security_deposit: 0, durations: [] },

    // Multi-select arrays:
    images,
    mainHierarchies,
    subHierarchies,
    kinds,
    ringTypes,
    tags,
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
