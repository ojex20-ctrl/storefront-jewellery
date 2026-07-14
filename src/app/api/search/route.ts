import { NextResponse } from "next/server"
import { fetchProducts } from "@/lib/medusa-products"
import type { Product } from "@/lib/products"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase()
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "12"), 1), 24)

  if (!q) return NextResponse.json({ results: [] })

  const products = await fetchProducts()
  const results = products
    .filter((product) => searchableText(product).includes(q))
    .sort((a, b) => score(b, q) - score(a, q))
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.kind,
      price: product.price,
      image: product.image,
    }))

  return NextResponse.json({ results })
}

function searchableText(product: Product) {
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

function score(product: Product, q: string) {
  const name = product.name.toLowerCase()
  if (name === q) return 5
  if (name.startsWith(q)) return 4
  if (name.includes(q)) return 3
  return searchableText(product).includes(q) ? 1 : 0
}
