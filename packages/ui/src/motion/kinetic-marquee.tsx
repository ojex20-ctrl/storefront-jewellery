"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

type KineticMarqueeProps = {
  items: string[]
  /** Reverse direction. */
  reverse?: boolean
  /** Pixels per second. */
  speed?: number
  /** Optional scroll-driven extra velocity (x px / scroll px). */
  scrollBoost?: number
  className?: string
  /** Inline style (font-size etc). */
  style?: React.CSSProperties
}

/**
 * Continuously-scrolling text strip with optional scroll-velocity boost
 * — the more the user scrolls, the faster the marquee runs. Used twice
 * on the SYRA home in opposite directions for that y2k ticker stack
 * feeling.
 */
export function KineticMarquee({
  items,
  reverse,
  speed = 80,
  scrollBoost = 0.5,
  className,
  style,
}: KineticMarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const boost = useTransform(scrollYProgress, [0, 1], [0, scrollBoost * 1000])

  // Triple the items to prevent visible loop break on small lists.
  const tripled = [...items, ...items, ...items]
  // Auto-pick a duration so speed is roughly constant regardless of count.
  const duration = (1000 / speed) * tripled.length

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex items-center whitespace-nowrap"
        style={{ x: reverse ? boost : useTransform(boost, (v) => -v) }}
      >
        <motion.div
          className="flex items-center"
          animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
          transition={{ duration, ease: "linear", repeat: Infinity }}
        >
          {tripled.map((it, i) => (
            <span key={i} className="px-8" style={style}>
              {it}
              <span aria-hidden className="ml-8 inline-block opacity-40">
                ✦
              </span>
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
