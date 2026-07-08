"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

type State = {
  exitPopupDismissedAt: number | null
  dismissExitPopup: () => void
}

export const useMarketingStore = create<State>()(
  persist(
    (set) => ({
      exitPopupDismissedAt: null,
      dismissExitPopup: () => set({ exitPopupDismissedAt: Date.now() }),
    }),
    { name: "syra-marketing" },
  ),
)
