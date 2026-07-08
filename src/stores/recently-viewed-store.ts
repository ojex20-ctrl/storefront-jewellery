"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const MAX_RECENT = 12

type Viewed = {
  id: string
  name: string
  image: string
  price: number
  kind: string
  viewedAt: number
}

type State = {
  items: Viewed[]
  track: (item: Omit<Viewed, "viewedAt">) => void
  clear: () => void
}

export const useRecentlyViewedStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      track: (item) =>
        set((s) => ({
          items: [
            { ...item, viewedAt: Date.now() },
            ...s.items.filter((x) => x.id !== item.id),
          ].slice(0, MAX_RECENT),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "syra-recently-viewed" },
  ),
)
