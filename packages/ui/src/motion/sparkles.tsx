"use client"
import { useMemo } from "react"
import { motion } from "framer-motion"

type SparklesProps = {
  /** Number of sparkles. Higher = denser. */
  count?: number
  /** Sparkle hex. Defaults to brand accent. */
  color?: string
  /** Min/max sparkle size in px. */
  size?: [number, number]
  className?: string
}

/**
 * Decorative twinkling-dust layer. Renders `count` randomised dots that
 * fade in/out at staggered intervals — meant to sit absolutely-positioned
 * inside a hero or card to suggest sparkle without being heavy.
 *
 * Pure CSS via Framer (no canvas, no requestAnimationFrame outside the
 * framework) so it composts well with Lenis and route transitions.
 */
export function Sparkles({
  count = 36,
  color = "var(--accent)",
  size = [2, 5],
  className,
}: SparklesProps) {
  // Stable seed per mount so positions don't shift between re-renders.
  const dots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 2.5 + Math.random() * 3,
        s: size[0] + Math.random() * (size[1] - size[0]),
      })),
    [count, size],
  )
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.s,
            height: d.s,
            background: color,
            boxShadow: `0 0 ${d.s * 2}px ${color}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0, 1, 0] }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
