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
      className="inline-flex h-9 items-center justify-center gap-2 border-l border-line px-3 font-mono text-[10px] uppercase tracking-widest text-ink transition-colors hover:text-accent"
    >
      {isDark ? <Sun className="h-4 w-4" strokeWidth={1.7} /> : <Moon className="h-4 w-4" strokeWidth={1.7} />}
      <span className="hidden lg:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  )
}
