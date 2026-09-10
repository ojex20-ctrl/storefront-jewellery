/**
 * Shared cart-line → Medusa variant resolver.
 *
 * Cart lines are stored locally with whatever fields each storefront's
 * `toCartLine` chose to keep (size + colour name + length / metal hex /
 * volume ml / etc.). At checkout we need a `variant_id`. Rather than
 * threading variant ids through every storefront's cart store, we look
 * the variants up at checkout time:
 *
 *   1. Fetch each product (cached per handle).
 *   2. For each cart line, run the storefront-supplied predicate over
 *      the product's variants. First match wins.
 *   3. If nothing matches, fall back to the first variant — keeps the
 *      checkout from blocking on a stale local cart while still flagging
 *      the issue back to the caller via `unresolved`.
 *
 * If `unresolved.length > 0`, the caller can choose whether to abort or
 * continue. Storefronts log it; the admin can spot-check the order's
 * line items afterwards.
 */

export type MedusaVariantOption = { value: string; option?: { title?: string } }
export type MedusaVariantSummary = {
  id: string
  title?: string
  options?: MedusaVariantOption[]
}
export type MedusaProductSummary = {
  id: string
  handle: string
  variants?: MedusaVariantSummary[]
}

export type ResolveOptions<TLine> = {
  backendUrl: string
  publishableKey: string
  /** Cart line → product handle */
  handleOf: (line: TLine) => string
  /** Cart line × variant → does this variant match? */
  match: (line: TLine, variant: MedusaVariantSummary) => boolean
  /** Quantity for the resolved line. */
  quantityOf: (line: TLine) => number
}

export type ResolveResult = {
  items: { variant_id: string; quantity: number }[]
  unresolved: string[] // human-readable line descriptions
}

const cache = new Map<string, MedusaProductSummary>()

async function fetchProduct(
  backendUrl: string,
  publishableKey: string,
  handle: string,
): Promise<MedusaProductSummary | null> {
  const key = `${backendUrl}|${handle}`
  if (cache.has(key)) return cache.get(key)!
  const r = await fetch(
    `${backendUrl}/store/products?handle=${encodeURIComponent(handle)}&fields=id,handle,*variants,*variants.options,*variants.options.option`,
    {
      headers: { "x-publishable-api-key": publishableKey },
      cache: "no-store",
    },
  )
  if (!r.ok) return null
  const j = (await r.json()) as { products: MedusaProductSummary[] }
  const p = j.products?.[0] ?? null
  if (p) cache.set(key, p)
  return p
}

export async function resolveVariants<TLine extends { name?: string }>(
  lines: TLine[],
  opts: ResolveOptions<TLine>,
): Promise<ResolveResult> {
  const items: { variant_id: string; quantity: number }[] = []
  const unresolved: string[] = []

  for (const line of lines) {
    const handle = opts.handleOf(line)
    const product = await fetchProduct(opts.backendUrl, opts.publishableKey, handle)
    if (!product || (product.variants ?? []).length === 0) {
      unresolved.push(`${line.name ?? handle} — product not found in Medusa`)
      continue
    }
    const variants = product.variants!
    const matched = variants.find((v) => opts.match(line, v))
    const variant = matched ?? variants[0]!
    if (!matched) {
      unresolved.push(
        `${line.name ?? handle} — exact variant not matched, used first variant`,
      )
    }
    items.push({ variant_id: variant.id, quantity: opts.quantityOf(line) })
  }

  return { items, unresolved }
}

/** Pull a named option value off a Medusa variant ("Finish" → "Chrome"). */
export function variantOption(
  v: MedusaVariantSummary,
  title: string,
): string | undefined {
  return v.options?.find(
    (o) => (o.option?.title ?? "").toLowerCase() === title.toLowerCase(),
  )?.value
}
