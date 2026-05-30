"use client"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { SearchModal } from "@/components/search/search-modal"

/**
 * Nav button that opens the search modal. Also wires Cmd/Ctrl+K as a global
 * keyboard shortcut so power users don't have to hunt for the icon.
 */
export function SearchTrigger() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest hover:text-accent md:inline-flex"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="hidden text-muted lg:inline">⌘K</span>
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
