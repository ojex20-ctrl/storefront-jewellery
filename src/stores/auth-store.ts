"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Customer = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
}

type State = {
  token: string | null
  customer: Customer | null
  setSession: (token: string, customer: Customer) => void
  setCustomer: (customer: Customer | null) => void
  clear: () => void
  isAuthed: () => boolean
}

/**
 * Local auth store. Holds the Medusa JWT and a thin Customer DTO so the
 * UI can render greetings without a roundtrip on every page.
 *
 * The token persists to localStorage — fine for a storefront, but flag it
 * if you ever ship admin features here. Logout (`clear()`) wipes both
 * fields and is fired from the Account page and the cart drawer.
 */
export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      token: null,
      customer: null,
      setSession: (token, customer) => set({ token, customer }),
      setCustomer: (customer) => set({ customer }),
      clear: () => set({ token: null, customer: null }),
      isAuthed: () => Boolean(get().token),
    }),
    { name: "podium-auth" },
  ),
)
