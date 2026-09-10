"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

type ConfettiBurstProps = {
  /** Toggles a single burst. Set to a fresh number/string each fire. */
  trigger: unknown
  /** Number of particles — keep < 60 for snappy feel. */
  count?: number
  /** Palette to sample from. Defaults to the y2k chrome set. */
  colors?: string[]
}

/**
 * One-shot particle burst at the click origin. Use as a child of any
 * relatively-positioned element. Toggle the `trigger` prop (e.g. by
 * incrementing a counter on every "add to cart" click) to fire a fresh
 * burst — particles fly out, fade, and unmount.
 *
 * No canvas. Pure framer-motion springs so it composts well with route
 * transitions and Lenis scroll.
 */
export function ConfettiBurst({
  trigger,
  count = 28,
  colors = ["#ff5cf3", "#5ce5ff", "#c1ff3a", "#ffd029", "#ffffff", "#1f0e3d"],
}: ConfettiBurstProps) {
  const [seed, setSeed] = useState(0)
  useEffect(() => {
    setSeed((n) => n + 1)
  }, [trigger])

  const particles = Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
    const distance = 80 + Math.random() * 140
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 40, // slight upward bias
      color: colors[i % colors.length],
      size: 5 + Math.random() * 7,
      rot: Math.random() * 720 - 360,
    }
  })

  return (
    <AnimatePresence>
      {seed > 0 && (
        <motion.div
          key={seed}
          className="pointer-events-none absolute inset-0 z-[60]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute left-1/2 top-1/2 block"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: p.id % 2 === 0 ? "9999px" : "2px",
                boxShadow: `0 0 ${p.size}px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: p.dx, y: p.dy, opacity: 0, rotate: p.rot }}
              transition={{
                duration: 0.9 + Math.random() * 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
