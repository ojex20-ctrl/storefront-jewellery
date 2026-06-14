"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark"

type State = {
  theme: Theme
  toggle: () => void
  set: (t: Theme) => void
}

export const useThemeStore = create<State>()(
  persist(
    (set) => ({
      theme: "dark",
      toggle: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      set: (t) => set({ theme: t }),
    }),
    { name: "ziora-theme" },
  ),
)
