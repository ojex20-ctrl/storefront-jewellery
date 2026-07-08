import { NextResponse } from "next/server"
import { fetchProducts } from "@/lib/medusa-products"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const productId = url.searchParams.get("productId")
  const products = await fetchProducts()
  const current = products.find((p) => p.id === productId)
  const recommended = products
    .filter((p) => p.id !== productId)
    .sort((a, b) => score(b, current) - score(a, current))
    .slice(0, 8)
  return NextResponse.json({ products: recommended })
}

function score(product: Awaited<ReturnType<typeof fetchProducts>>[number], current?: Awaited<ReturnType<typeof fetchProducts>>[number]) {
  if (!current) return 0
  let value = 0
  if (product.kind === current.kind) value += 4
  if (product.subcategory && product.subcategory === current.subcategory) value += 2
  value += product.metals.filter((m) => current.metals.includes(m)).length
  value += product.stones.filter((s) => current.stones.includes(s)).length
  return value
}
