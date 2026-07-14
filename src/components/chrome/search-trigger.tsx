"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Search } from "lucide-react"

/**
 * Header search entry point. Keep it as a direct link so there is no hidden
 * popup state competing with the dedicated search page.
 */
export function SearchTrigger() {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        router.push("/search")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])

  return (
    <Link
      href="/search"
      aria-label="Search"
      className="inline-flex h-9 items-center gap-2 px-3 font-mono text-[10px] uppercase tracking-widest transition-colors hover:text-accent"
    >
      <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span className="hidden sm:inline">Search</span>
    </Link>
  )
}
