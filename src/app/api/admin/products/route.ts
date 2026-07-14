import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { normalizeProductInput, validateProductInput } from "@/lib/product-input"
import { hasPermission } from "@/lib/rbac"
import { normalizeSlug } from "@/lib/validation"

const MAX_LIMIT = 100

/** Parse an int query param, falling back and clamping to [min, max]. */
function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = parseInt(raw ?? "", 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

export async function GET(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const url = new URL(req.url)
  const page = clampInt(url.searchParams.get("page"), 1, 1, Number.MAX_SAFE_INTEGER)
  const limit = clampInt(url.searchParams.get("limit"), 50, 1, MAX_LIMIT)
  const search = (url.searchParams.get("search") ?? "").trim().slice(0, 120)

  const where = search ? { name: { contains: search } } : {}
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])
  return NextResponse.json({ products, total, page, limit })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "products:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const body = await req.json().catch(() => null)
    const isArray = Array.isArray(body)
    const items = isArray ? body : [body]
    if (items.length === 0 || items.length > 100) {
      return NextResponse.json({ error: "Submit between 1 and 100 products." }, { status: 400 })
    }

    const cleanItems = []
    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return NextResponse.json({ error: "Invalid product payload." }, { status: 400 })
      }
      const product = item as Record<string, unknown>
      product.slug = product.slug ? normalizeSlug(product.slug) : normalizeSlug(product.name)
      const error = validateProductInput(product)
      if (error) return NextResponse.json({ error }, { status: 400 })
      // Whitelist + normalize (drops unknown/virtual fields, serializes arrays, coerces numbers)
      cleanItems.push(normalizeProductInput(product))
    }

    // Database insertion wrapped in a transaction for all-or-nothing safety
    const results = await prisma.$transaction(
      cleanItems.map((data) => prisma.product.create({ data }))
    )

    if (isArray) {
      return NextResponse.json({ products: results }, { status: 201 })
    } else {
      return NextResponse.json({ product: results[0] }, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product(s)" },
      { status: 400 }
    )
  }
}
