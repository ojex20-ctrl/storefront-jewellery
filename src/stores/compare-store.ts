"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const MAX_COMPARE = 4

type State = {
  ids: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
  remove: (id: string) => void
  clear: () => void
}

export const useCompareStore = create<State>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => {
          if (s.ids.includes(id)) return { ids: s.ids.filter((x) => x !== id) }
          return { ids: [id, ...s.ids].slice(0, MAX_COMPARE) }
        }),
      has: (id) => get().ids.includes(id),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "syra-compare" },
  ),
)
