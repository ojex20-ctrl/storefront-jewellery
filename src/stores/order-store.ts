"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartLine } from "./cart-store"

export type LocalOrder = {
  id: string
  details: {
    email: string
    firstName: string
    lastName: string
    address: string
    city: string
    postcode: string
    country: string
    phone: string
  }
  items: CartLine[]
  total: number
  shipping: "standard" | "express" | "pickup"
  payment: "razorpay" | "stripe"
  createdAt: number
}

type State = {
  orders: LocalOrder[]
  add: (o: LocalOrder) => void
  byId: (id: string) => LocalOrder | undefined
}

/**
 * Local order log used by the demo confirmation + account screens before
 * Medusa orders are wired up end-to-end. Once /api/checkout/place is
 * connected to a real Medusa cart, swap reads to fetch from `/store/orders`.
 */
export const useOrderStore = create<State>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      byId: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "podium-orders" },
  ),
)
