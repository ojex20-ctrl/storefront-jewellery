import type { Prisma } from "@prisma/client"
import { isNonNegativeMoney, isValidPlainText, isValidSlug, isValidUrlOrPath, normalizeSlug } from "./validation"

/**
 * Normalizes and whitelists product input coming from the admin forms / API.
 *
 * Two jobs:
 *  1. Whitelist — only known, writable columns are kept. This prevents
 *     mass-assignment (e.g. a client setting `id`) and stops unknown keys
 *     (like the virtual `vibe` field) from crashing Prisma validation.
 *  2. Normalize — mirror the multi-select arrays into their legacy single
 *     fields and serialize every JSON-array column to a string.
 *
 * Used by POST /api/admin/products and PUT /api/admin/products/[id] so the two
 * routes can never drift out of sync.
 */

/** Columns a client is allowed to write. `id`, `createdAt`, `updatedAt` are excluded. */
const WRITABLE_FIELDS = new Set([
  "name", "slug", "kind", "subcategory", "caption", "description",
  "price", "compareAtPrice",
  "metals", "stones", "sizes", "tag", "image", "gallery",
  "modelImages", "bundleIds", "weight", "material", "warranty",
  "seoTitle", "seoDescription",
  "mainHierarchy", "subHierarchy",
  "images", "mainHierarchies", "subHierarchies", "kinds",
  "ringType", "ringTypes", "tags",
  "published", "featured", "sortOrder",
])

function coerceInt(value: unknown, field: string): number {
  const n = typeof value === "number" ? value : parseInt(String(value), 10)
  if (!Number.isFinite(n)) throw new Error(`Invalid ${field}: expected a number`)
  return n
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

function optionalPlainText(value: unknown, max: number) {
  if (value === undefined || value === null || value === "") return true
  return isValidPlainText(value, { max })
}

function imageValues(input: Record<string, unknown>) {
  const raw = Array.isArray(input.images) ? input.images : toArray(input.image)
  return raw.map((item) => String(item ?? "").trim()).filter(Boolean)
}

export function validateProductInput(input: unknown, options: { partial?: boolean } = {}) {
  const partial = Boolean(options.partial)
  if (!input || typeof input !== "object" || Array.isArray(input)) return "Product payload must be an object."
  const data = input as Record<string, unknown>

  if ((!partial || "name" in data) && !isValidPlainText(data.name, { required: true, max: 160 })) return "Product name is required."

  const slug = "slug" in data ? normalizeSlug(data.slug) : (!partial ? normalizeSlug(data.name) : "")
  if ((!partial || "slug" in data) && !isValidSlug(slug)) return "Enter a valid product slug."

  if (!partial || "price" in data) {
    const price = Number(data.price)
    if (!Number.isInteger(price) || !isNonNegativeMoney(price)) return "Enter a valid product price."
  }
  if (data.compareAtPrice !== undefined && data.compareAtPrice !== null && data.compareAtPrice !== "") {
    const compareAtPrice = Number(data.compareAtPrice)
    if (!Number.isInteger(compareAtPrice) || !isNonNegativeMoney(compareAtPrice)) return "Enter a valid compare-at price."
  }
  if (data.weight !== undefined && data.weight !== null && data.weight !== "") {
    const weight = Number(data.weight)
    if (!Number.isFinite(weight) || weight < 0 || weight > 100000) return "Enter a valid product weight."
  }

  for (const field of ["caption", "description", "material", "warranty", "seoTitle", "seoDescription", "kind", "subcategory", "tag", "mainHierarchy", "subHierarchy"]) {
    if (!optionalPlainText(data[field], field === "description" ? 5000 : 500)) return `Enter valid text for ${field}.`
  }

  const images = imageValues(data)
  if (images.length > 12) return "A product can have up to 12 images."
  if (images.some((image) => !isValidUrlOrPath(image))) return "Product images must be valid URLs or site paths."

  return null
}

// `partial` (used by PUT) only transforms a group when one of its keys is
// present, so partial updates like a Live/Draft toggle ({ published: true })
// don't blank out media/classification columns. Create (POST) uses full mode,
// which fills every column with its default.
export function normalizeProductInput(
  input: Record<string, unknown>,
  options?: { partial?: false },
): Prisma.ProductUncheckedCreateInput
export function normalizeProductInput(
  input: Record<string, unknown>,
  options: { partial: true },
): Prisma.ProductUncheckedUpdateInput
export function normalizeProductInput(
  input: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {},
): Prisma.ProductUncheckedCreateInput | Prisma.ProductUncheckedUpdateInput {
  const data: Record<string, unknown> = {}
  for (const key of Object.keys(input)) {
    if (WRITABLE_FIELDS.has(key)) data[key] = input[key]
  }
  const has = (...keys: string[]) => !partial || keys.some((k) => k in data)
  if (typeof data.slug === "string") data.slug = normalizeSlug(data.slug)

  if (has("images", "image")) {
    const imagesArr = Array.isArray(data.images) ? data.images : toArray(data.image)
    data.images = JSON.stringify(imagesArr)
    data.image = imagesArr[0] || ""
    data.gallery = JSON.stringify(imagesArr)
  }

  if (has("kinds", "kind")) {
    const kindsArr = Array.isArray(data.kinds) ? data.kinds : toArray(data.kind)
    data.kinds = JSON.stringify(kindsArr)
    data.kind = kindsArr[0] || "Ring"
  }

  if (has("mainHierarchies", "mainHierarchy")) {
    const mainArr = Array.isArray(data.mainHierarchies) ? data.mainHierarchies : toArray(data.mainHierarchy)
    data.mainHierarchies = JSON.stringify(mainArr)
    data.mainHierarchy = mainArr[0] || null
  }

  if (has("subHierarchies", "subHierarchy")) {
    const subArr = Array.isArray(data.subHierarchies) ? data.subHierarchies : toArray(data.subHierarchy)
    data.subHierarchies = JSON.stringify(subArr)
    data.subHierarchy = subArr[0] || null
  }

  if (has("ringType", "ringTypes")) {
    const ringTypeArr = Array.isArray(data.ringType)
      ? data.ringType
      : (Array.isArray(data.ringTypes) ? data.ringTypes : [])
    data.ringType = JSON.stringify(ringTypeArr)
  }
  delete data.ringTypes

  if (has("tags", "tag")) {
    const tagsArr = Array.isArray(data.tags) ? data.tags : toArray(data.tag)
    data.tags = JSON.stringify(tagsArr)
    data.tag = tagsArr[0] || null
  }

  for (const field of ["metals", "stones", "sizes", "modelImages", "bundleIds"]) {
    if (Array.isArray(data[field])) {
      data[field] = JSON.stringify(data[field])
    } else if (!partial && data[field] === undefined) {
      data[field] = "[]"
    }
  }

  if (data.price !== undefined) data.price = coerceInt(data.price, "price")
  if (data.compareAtPrice !== undefined && data.compareAtPrice !== null && data.compareAtPrice !== "") {
    data.compareAtPrice = coerceInt(data.compareAtPrice, "compareAtPrice")
  }
  if (data.sortOrder !== undefined) data.sortOrder = coerceInt(data.sortOrder, "sortOrder")

  return data as Prisma.ProductUncheckedCreateInput | Prisma.ProductUncheckedUpdateInput
}
