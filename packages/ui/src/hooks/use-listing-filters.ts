"use client"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

/**
 * Shared listing-filter state with URL sync.
 *
 * Each storefront has different facet axes (size×color for clothing,
 * family×concentration for perfumes, kind×finish×color for jewellery), so
 * we don't bake the schema in. Caller passes a list of axis keys, the
 * hook handles:
 *   - multi-select toggle (a value is either in the set or not)
 *   - URL ?key=a,b,c serialisation (replaceState — back button stays sane)
 *   - price range  (?price_min=100&price_max=500)
 *   - text query   (?q=…)
 *   - sort order   (?sort=low|high|featured)
 *   - clear all / clear one axis
 *
 * Returns plain state + setters. The component composes a `filter` predicate
 * itself so the schema stays type-safe per storefront.
 */
export type SortOrder = "featured" | "low" | "high" | "new"

export type ListingFiltersState = {
  /** Per-axis selected values (multi-select). */
  facets: Record<string, string[]>
  /** Inclusive price range; `null` ends mean "no bound". */
  price: [number | null, number | null]
  /** Search query string (empty = none). */
  query: string
  /** Sort order. */
  sort: SortOrder
}

type Options = {
  /** All axis keys this listing supports — drives URL sync allow-list. */
  axes: readonly string[]
  /** Default sort order when ?sort= is missing. */
  defaultSort?: SortOrder
  /** Whether to also read/write the search query (?q=). */
  withQuery?: boolean
  /** Whether to write changes to the URL (defaults true). */
  syncUrl?: boolean
}

export type ListingFilters = ListingFiltersState & {
  /** Toggle one value in/out of an axis. */
  toggleFacet: (axis: string, value: string) => void
  /** Replace one axis with the given values (or clear). */
  setFacet: (axis: string, values: string[]) => void
  /** Set price bounds; pass `null` to remove a bound. */
  setPrice: (range: [number | null, number | null]) => void
  /** Update the search query. */
  setQuery: (q: string) => void
  /** Update the sort order. */
  setSort: (s: SortOrder) => void
  /** Drop everything back to defaults. */
  clearAll: () => void
  /** Drop a single axis (or "price" / "query" / "sort"). */
  clear: (key: string) => void
  /** True if any filter is active beyond defaults. */
  isActive: boolean
  /** Total number of active selections — useful for "Filter (3)" badges. */
  activeCount: number
}

export function useListingFilters({
  axes,
  defaultSort = "featured",
  withQuery = true,
  syncUrl = true,
}: Options): ListingFilters {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Decode current URL into state. We do this lazily inside useMemo so
  // upstream re-renders (e.g. router.replace) re-derive cleanly.
  const state = useMemo<ListingFiltersState>(() => {
    const facets: Record<string, string[]> = {}
    for (const axis of axes) {
      const raw = searchParams.get(axis)
      facets[axis] = raw ? raw.split(",").filter(Boolean) : []
    }
    const minRaw = searchParams.get("price_min")
    const maxRaw = searchParams.get("price_max")
    const min = minRaw && !Number.isNaN(Number(minRaw)) ? Number(minRaw) : null
    const max = maxRaw && !Number.isNaN(Number(maxRaw)) ? Number(maxRaw) : null
    const query = withQuery ? (searchParams.get("q") ?? "") : ""
    const sort = (searchParams.get("sort") as SortOrder | null) ?? defaultSort
    return { facets, price: [min, max], query, sort }
  }, [searchParams, axes, withQuery, defaultSort])

  // Stable ref to current state so callbacks don't churn on every keystroke.
  const stateRef = useRef(state)
  stateRef.current = state

  const writeUrl = useCallback(
    (next: ListingFiltersState) => {
      if (!syncUrl) return
      const params = new URLSearchParams()
      for (const axis of axes) {
        if (next.facets[axis]?.length) params.set(axis, next.facets[axis].join(","))
      }
      if (next.price[0] != null) params.set("price_min", String(next.price[0]))
      if (next.price[1] != null) params.set("price_max", String(next.price[1]))
      if (withQuery && next.query) params.set("q", next.query)
      if (next.sort && next.sort !== defaultSort) params.set("sort", next.sort)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, axes, withQuery, defaultSort, syncUrl],
  )

  // Debounce only the query (URL replace per keystroke is wasteful and
  // breaks the back stack). All other changes write immediately.
  const queryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current)
    },
    [],
  )

  const update = useCallback(
    (patch: Partial<ListingFiltersState>) => {
      const next = { ...stateRef.current, ...patch }
      writeUrl(next)
    },
    [writeUrl],
  )

  const toggleFacet = useCallback(
    (axis: string, value: string) => {
      const cur = stateRef.current.facets[axis] ?? []
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
      update({ facets: { ...stateRef.current.facets, [axis]: next } })
    },
    [update],
  )

  const setFacet = useCallback(
    (axis: string, values: string[]) => {
      update({ facets: { ...stateRef.current.facets, [axis]: values } })
    },
    [update],
  )

  const setPrice = useCallback(
    (range: [number | null, number | null]) => update({ price: range }),
    [update],
  )

  const setQuery = useCallback(
    (q: string) => {
      // Optimistic local update so the input feels snappy, then debounced
      // URL write so navigation doesn't fire on every keystroke.
      stateRef.current = { ...stateRef.current, query: q }
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current)
      queryDebounceRef.current = setTimeout(() => writeUrl(stateRef.current), 200)
    },
    [writeUrl],
  )

  const setSort = useCallback(
    (s: SortOrder) => update({ sort: s }),
    [update],
  )

  const clearAll = useCallback(() => {
    const cleared: ListingFiltersState = {
      facets: Object.fromEntries(axes.map((a) => [a, [] as string[]])),
      price: [null, null],
      query: "",
      sort: defaultSort,
    }
    writeUrl(cleared)
  }, [axes, defaultSort, writeUrl])

  const clear = useCallback(
    (key: string) => {
      const s = stateRef.current
      if (key === "price") return update({ price: [null, null] })
      if (key === "query") return update({ query: "" })
      if (key === "sort") return update({ sort: defaultSort })
      return update({ facets: { ...s.facets, [key]: [] } })
    },
    [defaultSort, update],
  )

  const activeCount = useMemo(() => {
    let n = 0
    for (const axis of axes) n += state.facets[axis]?.length ?? 0
    if (state.price[0] != null) n += 1
    if (state.price[1] != null) n += 1
    if (state.query) n += 1
    return n
  }, [state, axes])

  const isActive = activeCount > 0 || state.sort !== defaultSort

  return {
    ...state,
    toggleFacet,
    setFacet,
    setPrice,
    setQuery,
    setSort,
    clearAll,
    clear,
    isActive,
    activeCount,
  }
}

/**
 * Build a predicate that matches `useListingFilters` state against the
 * given product. Each axis is mapped via `axisAccessor` to that product's
 * value(s), so a product matches if for every active axis at least one of
 * its values is in the selected set.
 */
export type AxisAccessor<T> = (product: T) => string | string[] | undefined

export function applyFilters<T>(
  products: readonly T[],
  filters: ListingFiltersState,
  options: {
    accessors: Record<string, AxisAccessor<T>>
    /** Required when products don't have a top-level `price` field. */
    priceAccessor?: (product: T) => number
    /** Optional text accessor — concatenated string searched against `query`. */
    searchText?: (product: T) => string
  },
): T[] {
  const priceOf =
    options.priceAccessor ?? ((p: T) => (p as unknown as { price: number }).price)
  const q = filters.query.trim().toLowerCase()
  const out = products.filter((p) => {
    // facets
    for (const [axis, values] of Object.entries(filters.facets)) {
      if (!values || values.length === 0) continue
      const accessor = options.accessors[axis]
      if (!accessor) continue
      const v = accessor(p)
      const arr = v == null ? [] : Array.isArray(v) ? v : [v]
      if (!arr.some((x) => values.includes(String(x)))) return false
    }
    // price
    const price = priceOf(p)
    const [pmin, pmax] = filters.price
    if (pmin != null && price < pmin) return false
    if (pmax != null && price > pmax) return false
    // query
    if (q && options.searchText) {
      const haystack = options.searchText(p).toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  if (filters.sort === "low") return out.slice().sort((a, b) => priceOf(a) - priceOf(b))
  if (filters.sort === "high") return out.slice().sort((a, b) => priceOf(b) - priceOf(a))
  return out
}
