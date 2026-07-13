/**
 * Product fetchers — reads from the local product database via Prisma.
 * Falls back to mock data if database is empty.
 */

import "server-only"
import type { Product } from "./products"
import { prisma } from "./db"
import { MOCK_PRODUCTS } from "./mock-data"

import { Product as DbProduct } from "@prisma/client"

const USE_MOCK_PRODUCTS = process.env.NODE_ENV !== "production"

const FALLBACK_IMAGES: Record<string, string> = {
  Ring: "/jewellery/gen-diamond-ring.png",
  Necklace: "/jewellery/gen-gold-necklace.png",
  Earrings: "/jewellery/gen-crystal-earrings.png",
  Bracelet: "/jewellery/gen-gold-bracelet.png",
  "Nose ring": "/jewellery/gen-pink-heart-ring.png",
}

function parseJsonArray<T = string>(raw: string | null | undefined): T[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed.filter(Boolean) as T[]) : []
  } catch {
    return []
  }
}

function dbToProduct(p: DbProduct): Product {
  const images = parseJsonArray<string>(p.images)
  const galleryImages = parseJsonArray<string>(p.gallery)
  const mainHierarchies = parseJsonArray<string>(p.mainHierarchies).length > 0 ? parseJsonArray<string>(p.mainHierarchies) : (p.mainHierarchy ? [p.mainHierarchy] : [])
  const subHierarchies = parseJsonArray<string>(p.subHierarchies).length > 0 ? parseJsonArray<string>(p.subHierarchies) : (p.subHierarchy ? [p.subHierarchy] : [])
  const kinds = parseJsonArray<string>(p.kinds).length > 0 ? parseJsonArray<string>(p.kinds) : (p.kind ? [p.kind] : [])
  const ringTypes = parseJsonArray<string>(p.ringType)
  const tags = parseJsonArray<string>(p.tags).length > 0 ? parseJsonArray<string>(p.tags) : (p.tag ? [p.tag] : [])
  const kind = (kinds[0] as Product["kind"]) || (p.kind as Product["kind"]) || "Ring"
  const fallbackImage = FALLBACK_IMAGES[kind] ?? FALLBACK_IMAGES.Ring ?? "/jewellery/gen-diamond-ring.png"
  const primaryImage = images[0] || p.image || galleryImages[0] || fallbackImage

  return {
    id: p.slug,
    name: p.name,
    kind,
    subcategory: p.subcategory ?? undefined,
    caption: p.caption,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    metals: parseJsonArray(p.metals),
    stones: parseJsonArray(p.stones),
    sizes: parseJsonArray(p.sizes),
    tag: (tags[0] as Product["tag"]) || (p.tag as Product["tag"]) || undefined,
    image: primaryImage,
    gallery: galleryImages.length > 0 ? galleryImages : (images.length > 0 ? images : [primaryImage]),
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
  return USE_MOCK_PRODUCTS ? MOCK_PRODUCTS : []
}

export async function fetchProduct(handle: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findUnique({ where: { slug: handle } })
    if (p) return p.published ? dbToProduct(p) : null

    const productCount = await prisma.product.count()
    if (productCount > 0) return null
  } catch {
    // DB not available
  }
  return USE_MOCK_PRODUCTS ? MOCK_PRODUCTS.find((m) => m.id === handle) ?? null : null
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
  return USE_MOCK_PRODUCTS ? MOCK_PRODUCTS.slice(0, n) : []
}
