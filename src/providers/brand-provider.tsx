"use client"
import { createContext, useContext, type ReactNode } from "react"
import type { BrandConfig } from "@/lib/brand-config"

const BrandContext = createContext<BrandConfig | null>(null)

/**
 * Makes the server-loaded BrandConfig available to any nested client
 * component (cart drawer, home, listing, footer copy) via `useBrand()`
 * — saves us from prop-drilling through every chrome layer.
 */
export function BrandProvider({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
}

/**
 * Throws when used outside a provider — every page is wrapped in the root
 * layout's BrandProvider, so missing context indicates a misplaced render.
 */
export function useBrand(): BrandConfig {
  const ctx = useContext(BrandContext)
  if (!ctx) {
    throw new Error("useBrand() must be used inside <BrandProvider> (root layout)")
  }
  return ctx
}
