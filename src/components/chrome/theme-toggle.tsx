"use client"

import { Moon, Sun } from "lucide-react"
import { useThemeStore } from "@/stores/theme-store"

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggle)
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-40 right-5 z-50 inline-flex h-11 w-11 items-center justify-center border border-line bg-bg text-ink shadow-xl transition-colors hover:border-accent hover:text-accent md:bottom-24 md:right-6"
    >
      {isDark ? <Sun className="h-4 w-4" strokeWidth={1.7} /> : <Moon className="h-4 w-4" strokeWidth={1.7} />}
    </button>
  )
}
