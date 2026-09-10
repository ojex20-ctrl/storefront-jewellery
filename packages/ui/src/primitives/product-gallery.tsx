"use client"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { assetUrl } from "../lib/asset"
import { cn } from "../lib/cn"

export type GalleryImage = {
  src: string
  alt?: string
}

type Props = {
  images: GalleryImage[]
  /** Border-color CSS var name. Defaults to `var(--line)`. */
  borderColor?: string
  /** Aspect ratio for the main image. Default 4/5 (portrait). */
  aspect?: string
  /** Optional sticker / badge node rendered top-left of the main image. */
  badge?: React.ReactNode
  className?: string
  /** Override styles for the main frame (e.g. SYRA's gradient-border). */
  frameClassName?: string
}

/**
 * Multi-image product gallery with:
 *
 *   - Thumbnail rail (vertical on md+, horizontal on mobile)
 *   - Hover-lens magnifier (≈2.2× on the active image)
 *   - Click-to-open lightbox with arrow-key nav + ESC to close
 *   - Swipe support on touch devices via PointerEvents
 *
 * Brand-agnostic: uses CSS vars (--line, --accent, --bg, --paper) so the
 * same component blends with PODIUM's editorial cream, CLUB PHEROMONE's
 * dark champagne, ZIORA's walnut, and SYRA's chrome-violet.
 */
export function ProductGallery({
  images,
  aspect = "4 / 5",
  badge,
  className,
  frameClassName,
}: Props) {
  const safe = images.filter((i) => Boolean(i.src))
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [hovering, setHovering] = useState(false)

  // Mouse position over the main image (0..1, 0..1) for the magnifier lens.
  const mxRaw = useMotionValue(0.5)
  const myRaw = useMotionValue(0.5)
  const mx = useSpring(mxRaw, { stiffness: 280, damping: 24 })
  const my = useSpring(myRaw, { stiffness: 280, damping: 24 })

  const next = () => setActive((i) => (i + 1) % safe.length)
  const prev = () => setActive((i) => (i - 1 + safe.length) % safe.length)

  // Keyboard nav inside the lightbox.
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false)
      else if (e.key === "ArrowRight") next()
      else if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, safe.length])

  if (safe.length === 0) return null

  const current = safe[active]!
  const url = assetUrl(current.src)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mxRaw.set((e.clientX - r.left) / r.width)
    myRaw.set((e.clientY - r.top) / r.height)
  }

  return (
    <div className={cn("flex flex-col-reverse gap-3 md:flex-row md:gap-5", className)}>
      {/* THUMBNAIL RAIL */}
      {safe.length > 1 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {safe.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden border-2 transition-all md:h-20 md:w-20",
                active === i
                  ? "border-[color:var(--accent)] opacity-100"
                  : "border-[color:var(--line)] opacity-65 hover:opacity-100",
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${assetUrl(img.src)})` }}
              />
            </button>
          ))}
        </div>
      )}

      {/* MAIN IMAGE */}
      <div className="relative flex-1">
        <div
          className={cn("relative overflow-hidden", frameClassName)}
          style={{ aspectRatio: aspect }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onMouseMove={handleMove}
          onClick={() => setLightbox(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setLightbox(true)
            }
          }}
        >
          {/* Base image */}
          <span
            aria-label={current.alt}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${url})` }}
          />

          {/* Magnifier lens (desktop only) */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute hidden h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[color:var(--accent)] shadow-2xl md:block"
            style={
              {
                left: useTransformPercent(mx),
                top: useTransformPercent(my),
                opacity: hovering ? 1 : 0,
                backgroundImage: `url(${url})`,
                backgroundSize: "240%",
                backgroundPosition: useTransformBg(mx, my),
                transition: "opacity 0.2s",
              } as CSSProperties
            }
          />

          {/* Badge slot (sticker / tag) */}
          {badge && <div className="absolute left-3 top-3 z-10">{badge}</div>}

          {/* Bottom controls — counter + zoom hint + arrow nav */}
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
            {safe.length > 1 ? (
              <span className="rounded-full border border-[color:var(--line-2)] bg-[color:var(--bg)]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ink-2)] backdrop-blur">
                {String(active + 1).padStart(2, "0")} / {String(safe.length).padStart(2, "0")}
              </span>
            ) : (
              <span />
            )}
            <span className="hidden items-center gap-1 rounded-full border border-[color:var(--line-2)] bg-[color:var(--bg)]/85 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[color:var(--ink-2)] backdrop-blur md:inline-flex">
              <ZoomIn className="h-3 w-3" /> Click to zoom
            </span>
          </div>

          {/* Prev/next arrows on the main image (desktop) */}
          {safe.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-[color:var(--line-2)] bg-[color:var(--bg)]/85 p-2 text-[color:var(--ink)] backdrop-blur transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] md:flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-[color:var(--line-2)] bg-[color:var(--bg)]/85 p-2 text-[color:var(--ink)] backdrop-blur transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] md:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              aria-label="Close"
              onClick={() => setLightbox(false)}
              className="absolute right-5 top-5 rounded-full border border-white/40 bg-black/40 p-2 text-white hover:border-white"
            >
              <X className="h-5 w-5" />
            </button>

            {safe.length > 1 && (
              <>
                <button
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/40 p-3 text-white hover:border-white md:left-8"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-black/40 p-3 text-white hover:border-white md:right-8"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.img
              key={url}
              src={url}
              alt={current.alt ?? ""}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[90vh] max-w-[92vw] cursor-zoom-out object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-widest text-white/70">
              {active + 1} / {safe.length} · esc to close · ←/→ to nav
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Helpers to derive CSS strings from MotionValues without losing reactivity. */
function useTransformPercent(v: ReturnType<typeof useMotionValue<number>>) {
  const [s, set] = useState("50%")
  useEffect(() => {
    const unsub = v.on("change", (n) => set(`${n * 100}%`))
    set(`${v.get() * 100}%`)
    return unsub
  }, [v])
  return s
}
function useTransformBg(
  x: ReturnType<typeof useMotionValue<number>>,
  y: ReturnType<typeof useMotionValue<number>>,
) {
  const [s, set] = useState("50% 50%")
  useEffect(() => {
    const update = () => set(`${x.get() * 100}% ${y.get() * 100}%`)
    update()
    const u1 = x.on("change", update)
    const u2 = y.on("change", update)
    return () => {
      u1()
      u2()
    }
  }, [x, y])
  return s
}
