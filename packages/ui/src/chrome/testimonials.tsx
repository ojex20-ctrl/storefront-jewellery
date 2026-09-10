"use client"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Star } from "lucide-react"

export type Testimonial = {
  name: string
  product: string
  body: string
  /** Star rating 1-5; defaults to 5. */
  rating?: number
  /** Display location (e.g. "Dubai, AE"). */
  location?: string
  /** Display date (e.g. "Mar 2026"). */
  date?: string
}

type Props = {
  items: Testimonial[]
  /** Auto-advance interval ms. 0 disables auto-rotation. */
  intervalMs?: number
  className?: string
}

/**
 * Testimonial rotator — auto-advances every 6s, pauses on hover, dot
 * indicators, accessible button controls. Brand-agnostic via CSS vars.
 *
 * Drop on every storefront's home page just above or below the
 * featured-products grid for instant social proof.
 */
export function Testimonials({ items, intervalMs = 6000, className }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || intervalMs <= 0 || items.length < 2) return
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [paused, intervalMs, items.length])

  if (items.length === 0) return null
  const t = items[active]!
  const stars = t.rating ?? 5

  return (
    <section
      className={`relative overflow-hidden border-y border-line bg-bg-2 px-4 py-20 md:px-8 md:py-28 ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[920px] text-center">
        {/* Stars */}
        <div className="mb-5 flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < stars ? "fill-[color:var(--accent)] text-[color:var(--accent)]" : "text-line-2"}`}
              strokeWidth={1.5}
            />
          ))}
        </div>

        {/* Quote — animated swap */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p
              className="font-display tracking-tight"
              style={{ fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1.1 }}
            >
              <em className="not-italic">&ldquo;{t.body}&rdquo;</em>
            </p>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted">
              <strong className="text-ink">{t.name}</strong>
              {t.location && <> · {t.location}</>}
              {" · "}
              <span>{t.product}</span>
              {t.date && <> · {t.date}</>}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  active === i ? "w-8 bg-[color:var(--accent)]" : "w-2 bg-[color:var(--line-2)] hover:bg-[color:var(--accent)]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
