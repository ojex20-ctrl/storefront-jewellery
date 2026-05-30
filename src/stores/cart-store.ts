"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RentalLine = {
  /** ISO date string (YYYY-MM-DD) when the rental period begins. */
  start_date: string
  /** ISO date string when the piece must be returned. */
  end_date: string
  days: number
  daily_rate: number
  /** Fully-refundable deposit, charged separately, returned post-inspection. */
  security_deposit: number
}

export type CartLine = {
  /** Stable line id = product handle + size + color + (rental? + dates). */
  lineId: string
  productId: string
  name: string
  category: string
  /** For rentals this is the rental subtotal (days × daily_rate). For buys, the product price. */
  price: number
  image?: string
  size: string
  color: string
  qty: number
  /** Variant id from Medusa, populated when checkout creates a real cart. */
  variantId?: string
  /** Present iff the line is a rental. Buy lines leave this undefined. */
  rental?: RentalLine
}

type State = {
  items: CartLine[]
  open: boolean
  bumping: boolean
  add: (line: Omit<CartLine, "lineId" | "qty">, qty?: number) => void
  remove: (lineId: string) => void
  setQty: (lineId: string, qty: number) => void
  clear: () => void
  setOpen: (open: boolean) => void
  /** Total number of pieces (sum of qty). */
  count: () => number
  subtotal: () => number
  depositTotal: () => number
}

const buildLineId = (
  productId: string,
  size: string,
  color: string,
  rental?: RentalLine,
) =>
  rental
    ? `${productId}::rental::${rental.start_date}::${rental.days}`
    : `${productId}::${size}::${color}`

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      bumping: false,

      add: (line, qty = 1) => {
        const lineId = buildLineId(line.productId, line.size, line.color, line.rental)
        set((s) => {
          const existing = s.items.find((i) => i.lineId === lineId)
          const items = existing
            ? s.items.map((i) => (i.lineId === lineId ? { ...i, qty: i.qty + qty } : i))
            : [...s.items, { ...line, lineId, qty }]
          return { items, bumping: true }
        })
        // Drop the bump animation flag after the keyframes finish.
        setTimeout(() => set({ bumping: false }), 700)
        // Slide the drawer in shortly after so it doesn't fight the bump.
        setTimeout(() => set({ open: true }), 280)
      },

      remove: (lineId) => set((s) => ({ items: s.items.filter((i) => i.lineId !== lineId) })),

      setQty: (lineId, qty) =>
        set((s) =>
          qty <= 0
            ? { items: s.items.filter((i) => i.lineId !== lineId) }
            : { items: s.items.map((i) => (i.lineId === lineId ? { ...i, qty } : i)) },
        ),

      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),

      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      /** Item subtotal — rental fee + buy price. Deposits are computed separately by depositTotal. */
      subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      /** Total refundable deposits across rental lines. */
      depositTotal: () =>
        get().items.reduce(
          (s, i) => s + (i.rental?.security_deposit ?? 0) * i.qty,
          0,
        ),
    }),
    {
      name: "podium-cart",
      partialize: (s) => ({ items: s.items }),
    },
  ),
)
