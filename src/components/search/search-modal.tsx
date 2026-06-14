"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Search, X, Clock, ArrowRight } from "lucide-react"
import { Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"

type Hit = { id: string; name: string; category: string; price: number; image?: string }

const RECENT_KEY = "syra-recent-searches"
const RECENT_MAX = 6
const QUICK_QUERIES = ["Diamond", "Pearl", "Sapphire", "Ring", "Necklace", "Rental"]

function loadRecent(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s): s is string => typeof s === "string").slice(0, RECENT_MAX)
  } catch {
    return []
  }
}

function pushRecent(q: string) {
  if (typeof window === "undefined" || !q.trim()) return
  const cur = loadRecent().filter((s) => s.toLowerCase() !== q.toLowerCase())
  const next = [q, ...cur].slice(0, RECENT_MAX)
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Hit[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setRecent(loadRecent())
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQ("")
      setResults(null)
    }
  }, [open])

  useEffect(() => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    const handle = setTimeout(async () => {
      try {
        const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
        if (backend && key) {
          const resp = await fetch(
            `${backend}/store/products?q=${encodeURIComponent(q)}&limit=12&fields=handle,title,thumbnail,metadata,*variants.prices`,
            { headers: { "x-publishable-api-key": key } },
          )
          if (resp.ok) {
            type MedusaProduct = {
              handle: string
              title: string
              thumbnail?: string
              variants?: { prices?: { amount: number; currency_code: string }[] }[]
              metadata?: { kind?: string }
            }
            const data = (await resp.json()) as { products: MedusaProduct[] }
            const hits = data.products.map<Hit>((p) => ({
              id: p.handle,
              name: p.title,
              category: p.metadata?.kind ?? "Piece",
              price:
                p.variants?.[0]?.prices?.find((x) => x.currency_code === "aed")?.amount ?? 0,
              image: p.thumbnail,
            }))
            setResults(hits)
            setLoading(false)
            return
          }
        }
      } catch {
        /* fall through */
      }

      // ─── LOCAL FALLBACK ───
      // If backend fails, we try searching the mock data locally.
      // This is essential for a "fully working" demo without a live DB.
      try {
        const { MOCK_PRODUCTS } = await import("@/lib/mock-data")
        const lowerQ = q.toLowerCase()
        const hits = MOCK_PRODUCTS.filter(p => 
          p.name.toLowerCase().includes(lowerQ) || 
          p.kind.toLowerCase().includes(lowerQ) ||
          p.desc.toLowerCase().includes(lowerQ)
        ).map(p => ({
          id: p.id,
          name: p.name,
          category: p.kind,
          price: p.price,
          image: p.image
        }))
        setResults(hits)
      } catch {
        setResults([])
      }
      setLoading(false)
    }, 200)
    return () => clearTimeout(handle)
  }, [q])

  const grouped = useMemo(() => {
    if (!results) return null
    const out = new Map<string, Hit[]>()
    for (const h of results) {
      const arr = out.get(h.category) ?? []
      arr.push(h)
      out.set(h.category, arr)
    }
    return Array.from(out.entries())
  }, [results])

  const goToSearch = () => {
    if (!q.trim()) return
    pushRecent(q)
    onClose()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[150] bg-black/45 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed left-1/2 top-20 z-[151] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 border border-line bg-bg shadow-2xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                goToSearch()
              }}
              className="flex items-center gap-3 border-b border-line px-5 py-4"
            >
              <Search className="h-4 w-4 text-muted" strokeWidth={1.5} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the atelier…"
                className="flex-1 bg-transparent font-display text-2xl outline-none placeholder:text-muted"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="text-xs uppercase text-muted hover:text-ink"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="text-muted hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto">
              {!q && (
                <div className="px-5 py-6">
                  {recent.length > 0 && (
                    <div className="mb-6">
                      <Eyebrow className="mb-3 block">Recent</Eyebrow>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => setQ(r)}
                            className="inline-flex items-center gap-1.5 border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent"
                          >
                            <Clock className="h-3 w-3" strokeWidth={1.6} />
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Eyebrow className="mb-3 block">Try</Eyebrow>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_QUERIES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQ(s)}
                        className="border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-widest hover:border-ink"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {q && loading && (
                <div className="px-5 py-8">
                  <Eyebrow className="text-muted">Searching…</Eyebrow>
                </div>
              )}

              {q && !loading && results && results.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="font-display text-3xl">
                    <em>Nothing matches.</em>
                  </p>
                  <Eyebrow className="mt-2 block">Try a shorter term</Eyebrow>
                </div>
              )}

              {q && !loading && grouped && grouped.length > 0 && (
                <div>
                  {grouped.map(([category, hits]) => (
                    <div key={category}>
                      <div className="border-t border-line bg-bg-2 px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                        {category}
                        <span className="ml-2 text-ink">{hits.length}</span>
                      </div>
                      <ul className="flex flex-col">
                        {hits.map((r) => (
                          <li key={r.id}>
                            <Link
                              href={`/products/${r.id}`}
                              onClick={() => {
                                pushRecent(q)
                                onClose()
                              }}
                              className="flex items-center gap-4 border-t border-line px-5 py-3 transition-colors hover:bg-bg-2"
                            >
                              <div
                                className="h-12 w-9 shrink-0 border border-line bg-cover bg-center"
                                style={
                                  r.image ? { backgroundImage: `url(${r.image})` } : undefined
                                }
                              />
                              <div className="flex-1">
                                <p className="font-display text-lg">{r.name}</p>
                                <Eyebrow>{r.category}</Eyebrow>
                              </div>
                              <span className="font-mono text-xs">{priceFmt(r.price)}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <button
                    onClick={goToSearch}
                    className="flex w-full items-center justify-between border-t border-line px-5 py-3 text-left transition-colors hover:bg-bg-2"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
                      View all results for “{q}”
                    </span>
                    <ArrowRight className="h-4 w-4 text-accent" strokeWidth={1.6} />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-line px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted">
              <kbd className="rounded border border-line px-1.5 py-0.5">⌘ K</kbd> open ·{" "}
              <kbd className="rounded border border-line px-1.5 py-0.5">↵</kbd> view all ·{" "}
              <kbd className="rounded border border-line px-1.5 py-0.5">esc</kbd> close
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
