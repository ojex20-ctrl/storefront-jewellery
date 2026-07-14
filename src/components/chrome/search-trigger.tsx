"use client"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { SearchModal } from "@/components/search/search-modal"
import { MENU_SEARCH_HREF } from "@/lib/navigation"

export function SearchTrigger({
  renderButton = true,
  listenForHref = MENU_SEARCH_HREF,
}: {
  renderButton?: boolean
  listenForHref?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(true)
      }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>(`a[href="${listenForHref}"]`) : null
      if (!target) return
      event.preventDefault()
      setOpen(true)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [listenForHref])

  return (
    <>
      {renderButton && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Search"
          className="inline-flex h-9 items-center gap-2 px-3 font-mono text-[10px] uppercase tracking-widest text-ink transition-colors hover:text-accent"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">Search</span>
        </button>
      )}
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
