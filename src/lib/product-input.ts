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

// Returns `any` so the result stays assignable to Prisma's generated
// create/update input types (the callers previously passed the raw body as `any`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProductInput(input: Record<string, unknown>): any {
  // 1. Whitelist — drop any key we don't explicitly allow.
  const data: Record<string, any> = {}
  for (const key of Object.keys(input)) {
    if (WRITABLE_FIELDS.has(key)) data[key] = (input as Record<string, any>)[key]
  }

  // 2. Images (+ legacy single `image` / `gallery` mirror)
  const imagesArr = Array.isArray(data.images) ? data.images : (data.image ? [data.image] : [])
  data.images = JSON.stringify(imagesArr)
  data.image = imagesArr[0] || ""
  data.gallery = JSON.stringify(imagesArr)

  // 3. Kinds
  const kindsArr = Array.isArray(data.kinds) ? data.kinds : (data.kind ? [data.kind] : [])
  data.kinds = JSON.stringify(kindsArr)
  data.kind = kindsArr[0] || "Ring"

  // 4. Main hierarchies
  const mainArr = Array.isArray(data.mainHierarchies) ? data.mainHierarchies : (data.mainHierarchy ? [data.mainHierarchy] : [])
  data.mainHierarchies = JSON.stringify(mainArr)
  data.mainHierarchy = mainArr[0] || null

  // 5. Sub hierarchies
  const subArr = Array.isArray(data.subHierarchies) ? data.subHierarchies : (data.subHierarchy ? [data.subHierarchy] : [])
  data.subHierarchies = JSON.stringify(subArr)
  data.subHierarchy = subArr[0] || null

  // 6. Ring type (accepts `ringType` or `ringTypes`; column is `ringType`)
  const ringTypeArr = Array.isArray(data.ringType)
    ? data.ringType
    : (Array.isArray(data.ringTypes) ? data.ringTypes : [])
  data.ringType = JSON.stringify(ringTypeArr)
  delete data.ringTypes

  // 7. Tags (+ legacy single `tag` mirror)
  const tagsArr = Array.isArray(data.tags) ? data.tags : (data.tag ? [data.tag] : [])
  data.tags = JSON.stringify(tagsArr)
  data.tag = tagsArr[0] || null

  // 8. Remaining JSON-array columns
  for (const field of ["metals", "stones", "sizes", "modelImages", "bundleIds"]) {
    if (Array.isArray(data[field])) {
      data[field] = JSON.stringify(data[field])
    } else if (data[field] === undefined) {
      data[field] = "[]"
    }
  }

  // 9. Numeric columns — coerce and reject non-numbers before they reach Prisma.
  if (data.price !== undefined) data.price = coerceInt(data.price, "price")
  if (data.compareAtPrice !== undefined && data.compareAtPrice !== null && data.compareAtPrice !== "") {
    data.compareAtPrice = coerceInt(data.compareAtPrice, "compareAtPrice")
  }
  if (data.sortOrder !== undefined) data.sortOrder = coerceInt(data.sortOrder, "sortOrder")

  return data
}
