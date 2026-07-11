"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Eyebrow } from "@podium/ui/primitives"

type Review = {
  id: string
  name: string
  rating: number
  title: string | null
  body: string
  verified: boolean
  createdAt: string
}
type Summary = {
  average: number
  count: number
  distribution: { star: number; count: number }[]
  reviews: Review[]
}

function Stars({ value, size = 14, onSelect }: { value: number; size?: number; onSelect?: (n: number) => void }) {
  return (
    <span className="inline-flex" style={{ gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type={onSelect ? "button" : undefined}
          disabled={!onSelect}
          onClick={() => onSelect?.(n)}
          className={onSelect ? "cursor-pointer" : "cursor-default"}
          aria-label={onSelect ? `Rate ${n} star${n > 1 ? "s" : ""}` : undefined}
          style={{ lineHeight: 1 }}
        >
          <span style={{ fontSize: size }} className={n <= Math.round(value) ? "text-accent" : "text-line-2"}>★</span>
        </button>
      ))}
    </span>
  )
}

export function Reviews({ productId }: { productId: string }) {
  const [data, setData] = useState<Summary | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", rating: 0, title: "", body: "" })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" })
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ }
  }
  useEffect(() => { void load() }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!form.name.trim() || form.rating < 1 || !form.body.trim()) {
      toast.error("Please add your name, a rating, and a review.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Could not submit review")
      toast.success("Thank you for your review!")
      setForm({ name: "", rating: 0, title: "", body: "" })
      setShowForm(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review")
    } finally {
      setSubmitting(false)
    }
  }

  const count = data?.count ?? 0
  const average = data?.average ?? 0
  const maxBar = Math.max(1, ...(data?.distribution.map((d) => d.count) ?? [1]))

  return (
    <section className="border-t border-line px-4 py-16 md:px-8 md:py-24" id="reviews">
      <div className="mx-auto max-w-[1100px]">
        <Eyebrow className="mb-8 block">Reviews</Eyebrow>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[300px_1fr]">
          {/* Summary */}
          <div>
            <div className="flex items-end gap-3">
              <span className="font-display leading-none" style={{ fontSize: 72 }}>{average.toFixed(1)}</span>
              <div className="pb-2">
                <Stars value={average} size={16} />
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">
                  {count} {count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            {count > 0 && (
              <div className="mt-6 flex flex-col gap-1.5">
                {data!.distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-2 text-[11px]">
                    <span className="w-3 font-mono text-muted">{d.star}</span>
                    <span className="text-accent">★</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(d.count / maxBar) * 100}%` }} />
                    </div>
                    <span className="w-4 text-right font-mono text-muted">{d.count}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowForm((s) => !s)}
              className="mt-8 w-full border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-widest transition-colors hover:bg-ink hover:text-bg"
            >
              {showForm ? "Close" : "Write a review"}
            </button>
          </div>

          {/* List + form */}
          <div>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 border border-line p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Your rating</span>
                  <Stars value={form.rating} size={22} onSelect={(n) => setForm({ ...form, rating: n })} />
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="border-b border-line-2 bg-transparent py-2 text-sm outline-none focus:border-ink"
                  />
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Title (optional)"
                    className="border-b border-line-2 bg-transparent py-2 text-sm outline-none focus:border-ink"
                  />
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    placeholder="Share your experience with this piece…"
                    rows={4}
                    className="resize-none border border-line bg-transparent p-3 text-sm outline-none focus:border-ink"
                  />
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="self-start bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit review"}
                  </button>
                </div>
              </motion.div>
            )}

            {count === 0 ? (
              <p className="text-sm text-muted">No reviews yet. Be the first to share your thoughts.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {data!.reviews.map((r) => (
                  <li key={r.id} className="py-6 first:pt-0">
                    <div className="mb-1.5 flex items-center gap-3">
                      <Stars value={r.rating} />
                      {r.verified && (
                        <span className="font-mono text-[9px] uppercase tracking-widest text-accent">✓ Verified buyer</span>
                      )}
                    </div>
                    {r.title && <p className="font-display text-lg">{r.title}</p>}
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">{r.body}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                      {r.name} · {new Date(r.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
