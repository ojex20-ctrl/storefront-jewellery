/**
 * Type definitions for the jewellery catalogue.
 *
 * Variant axes differ from clothing (size + colour) and perfumes (volume):
 *   - kind          : Ring | Necklace | Earrings | Bracelet
 *   - metal         : 18k Gold | Sterling | Rose Gold | White Gold
 *   - stone         : Diamond | Sapphire | Emerald | Onyx | Pearl | None
 *   - size (optional, ring-only)
 *
 * Product data lives in Medusa — see `lib/medusa-products.ts`.
 */

import type { CartLine } from "@/stores/cart-store"

export type Kind = "Ring" | "Necklace" | "Earrings" | "Bracelet" | "Nose ring"
export type Metal = "18k Gold" | "Sterling" | "Rose Gold" | "White Gold"
export type Stone = "Diamond" | "Sapphire" | "Emerald" | "Onyx" | "Pearl" | "None"

export type RentalConfig = {
  enabled: boolean
  /** Daily rate in AED (currency follows the storefront default). */
  daily_rate: number
  /** Fully refundable deposit charged at checkout, returned within 5 working days of return. */
  security_deposit: number
  /** Whitelist of allowed rental durations in days (small set, shown as chips). */
  durations: number[]
  /** Optional fine-print line shown under the rental panel. */
  notes?: string
}

export type Product = {
  id: string
  name: string
  kind: Kind
  subcategory?: string
  caption: string
  price: number
  metals: Metal[]
  stones: Stone[]
  sizes: string[]
  tag?: "BESTSELLER" | "NEW" | "ONE OF ONE" | "LOW STOCK"
  image: string
  /** Full gallery shown on the detail page (always non-empty; falls back to [image]). */
  gallery: string[]
  desc: string
  modelPath?: string
  mainHierarchy?: string
  subHierarchy?: string
  /** Rental availability + pricing. Falls back to disabled when admin hasn't configured it. */
  rental: RentalConfig
}

export const METAL_NOTES: Record<Metal, string> = {
  "18k Gold": "18k gold PVD plating over surgical grade stainless steel. Anti-tarnish & waterproof.",
  "Sterling": "925 sterling silver with a protective rhodium layer to prevent oxidation.",
  "Rose Gold": "18k rose gold PVD plating. Hypoallergenic and sweat-resistant.",
  "White Gold": "Anti-tarnish white gold plating with a diamond-like luster.",
}

export const STONE_HEX: Record<Stone, string> = {
  Diamond: "#e8e6df",
  Sapphire: "#1d3a8a",
  Emerald: "#1f5d3a",
  Onyx: "#1a1a17",
  Pearl: "#f4f1e8",
  None: "transparent",
}

export type Mode = "buy" | "rent"

export type RentalSelection = {
  start_date: string
  end_date: string
  days: number
}

export function toCartLine(
  p: Product,
  metal: Metal,
  stone: Stone,
  size: string | null,
  options: { mode: "buy" } | { mode: "rent"; selection: RentalSelection } = { mode: "buy" },
): Omit<CartLine, "lineId" | "qty"> {
  const base = {
    productId: p.id,
    name: p.name,
    category: p.kind,
    image: p.image,
    size: size ?? metal,
    color: STONE_HEX[stone] ?? "#000",
  }
  if (options.mode === "rent") {
    const fee = p.rental.daily_rate * options.selection.days
    return {
      ...base,
      price: fee,
      rental: {
        start_date: options.selection.start_date,
        end_date: options.selection.end_date,
        days: options.selection.days,
        daily_rate: p.rental.daily_rate,
        security_deposit: p.rental.security_deposit,
      },
    }
  }
  return { ...base, price: p.price }
}
