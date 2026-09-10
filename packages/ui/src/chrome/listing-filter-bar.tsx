"use client"
import * as React from "react"
import { X, SlidersHorizontal } from "lucide-react"
import type { ListingFilters, SortOrder } from "../hooks/use-listing-filters"

type IconProps = { className?: string; strokeWidth?: number }
const XIcon = X as React.ElementType<IconProps>
const SlidersHorizontalIcon = SlidersHorizontal as React.ElementType<IconProps>

/**
 * Active-filter pills row + clear-all. Brand-agnostic — uses CSS variables
 * (`bg`, `accent`, `line`, `muted`) so each storefront's theme applies.
 *
 * Renders nothing when no filters are active so it doesn't reserve space
 * on a fresh page load.
 */
export type FacetLabelMap = Record<string, Record<string, string>>

export type ActiveFiltersProps = {
  filters: ListingFilters
  /** axis → { value: human label }. Missing entry falls back to the raw value. */
  labels?: FacetLabelMap
  /** Currency formatter for the price range pill. */
  formatPrice?: (n: number) => string
  className?: string
}

export function ActiveFilters({
  filters,
  labels,
  formatPrice,
  className,
}: ActiveFiltersProps) {
  if (!filters.isActive) return null
  const fmt = formatPrice ?? ((n) => `${n}`)
  const pills: { key: string; label: string; onRemove: () => void }[] = []

  for (const [axis, values] of Object.entries(filters.facets)) {
    for (const v of values ?? []) {
      const human = labels?.[axis]?.[v] ?? v
      pills.push({
        key: `${axis}:${v}`,
        label: human,
        onRemove: () => filters.toggleFacet(axis, v),
      })
    }
  }

  const [pmin, pmax] = filters.price
  if (pmin != null || pmax != null) {
    const label =
      pmin != null && pmax != null
        ? `${fmt(pmin)} – ${fmt(pmax)}`
        : pmin != null
        ? `≥ ${fmt(pmin)}`
        : `≤ ${fmt(pmax!)}`
    pills.push({
      key: "price",
      label,
      onRemove: () => filters.setPrice([null, null]),
    })
  }

  if (filters.query) {
    pills.push({
      key: "query",
      label: `“${filters.query}”`,
      onRemove: () => filters.setQuery(""),
    })
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {pills.map((p) => (
        <button
          key={p.key}
          onClick={p.onRemove}
          className="inline-flex items-center gap-1.5 border border-line bg-bg-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-2 transition-colors hover:border-accent hover:text-accent"
        >
          <span>{p.label}</span>
          <XIcon className="h-3 w-3" strokeWidth={1.8} />
        </button>
      ))}
      <button
        onClick={filters.clearAll}
        className="ml-1 font-mono text-[10px] uppercase tracking-widest text-muted underline-offset-4 hover:text-accent hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}

/**
 * Two number inputs side-by-side for min/max. Browsers without range
 * inputs fall through to plain text — fine for our tiny usage.
 */
export type PriceRangeProps = {
  filters: ListingFilters
  /** Hard floor / ceiling for the catalogue. */
  bounds: [number, number]
  /** Currency code for placeholders (AED, USD, …). */
  currency?: string
  className?: string
}

export function PriceRange({
  filters,
  bounds,
  currency,
  className,
}: PriceRangeProps) {
  const [min, max] = filters.price
  const [floor, ceiling] = bounds
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {currency ?? ""}
      </span>
      <input
        type="number"
        inputMode="numeric"
        placeholder={String(floor)}
        value={min ?? ""}
        min={floor}
        max={ceiling}
        onChange={(e) => {
          const raw = e.target.value
          filters.setPrice([raw === "" ? null : Number(raw), max])
        }}
        className="w-20 border border-line bg-bg px-2 py-1 font-mono text-[11px] outline-none focus:border-accent"
      />
      <span className="text-muted">–</span>
      <input
        type="number"
        inputMode="numeric"
        placeholder={String(ceiling)}
        value={max ?? ""}
        min={floor}
        max={ceiling}
        onChange={(e) => {
          const raw = e.target.value
          filters.setPrice([min, raw === "" ? null : Number(raw)])
        }}
        className="w-20 border border-line bg-bg px-2 py-1 font-mono text-[11px] outline-none focus:border-accent"
      />
    </div>
  )
}

/**
 * Standardised sort picker — same options across all storefronts so users
 * have one mental model.
 */
export type SortPickerProps = {
  filters: ListingFilters
  className?: string
  /** Override the option labels (e.g. translate). */
  labels?: Partial<Record<SortOrder, string>>
}

export function SortPicker({ filters, className, labels }: SortPickerProps) {
  const opts: { value: SortOrder; label: string }[] = [
    { value: "featured", label: labels?.featured ?? "Featured" },
    { value: "low", label: labels?.low ?? "Price · low → high" },
    { value: "high", label: labels?.high ?? "Price · high → low" },
    { value: "new", label: labels?.new ?? "Newest" },
  ]
  return (
    <label className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        Sort
      </span>
      <select
        value={filters.sort}
        onChange={(e) => filters.setSort(e.target.value as SortOrder)}
        className="cursor-pointer border border-line bg-bg px-2 py-1 font-mono text-[11px] outline-none hover:border-accent focus:border-accent"
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

/**
 * "Filter (3)" toggle button — used to open a mobile filter drawer. The
 * drawer itself is brand-specific so we don't render it here, just the
 * trigger + count badge.
 */
export type FilterToggleProps = {
  filters: ListingFilters
  onClick: () => void
  className?: string
  label?: string
}

export function FilterToggle({
  filters,
  onClick,
  className,
  label = "Filter",
}: FilterToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border border-line bg-bg px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent ${className ?? ""}`}
    >
      <SlidersHorizontalIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
      <span>{label}</span>
      {filters.activeCount > 0 && (
        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] text-bg">
          {filters.activeCount}
        </span>
      )}
    </button>
  )
}
