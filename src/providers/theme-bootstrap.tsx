"use client"
import { useEffect } from "react"
import { useThemeStore } from "@/stores/theme-store"

/**
 * Reads persisted theme from localStorage on mount and applies it to <html>.
 * Wrapped as a Client Component so the rest of the layout can stay server-rendered.
 */
export function ThemeBootstrap() {
  const theme = useThemeStore((s) => s.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return null
}
