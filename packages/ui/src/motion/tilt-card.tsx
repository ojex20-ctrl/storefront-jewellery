"use client"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"

type TiltCardProps = {
  children: ReactNode
  /** Max tilt in degrees on either axis. */
  max?: number
  /** Additional class on the outer wrapper. */
  className?: string
  /** Lift the card on hover (px). 0 to disable. */
  lift?: number
}

/**
 * 3D tilt-on-cursor card — the kind of card that slowly tilts toward the
 * mouse and snaps back on leave. Springs are damped so it feels playful
 * but not jittery. Adds a subtle gloss highlight that follows the cursor.
 */
export function TiltCard({
  children,
  max = 10,
  className,
  lift = 6,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18 })
  const sy = useSpring(y, { stiffness: 220, damping: 18 })

  const rotX = useTransform(sy, [-0.5, 0.5], [max, -max])
  const rotY = useTransform(sx, [-0.5, 0.5], [-max, max])
  const glossX = useTransform(sx, [-0.5, 0.5], ["20%", "80%"])
  const glossY = useTransform(sy, [-0.5, 0.5], ["20%", "80%"])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ y: -lift }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
      }}
      className={`relative ${className ?? ""}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          background: `radial-gradient(circle at ${glossX.get()} ${glossY.get()}, rgba(255,255,255,0.35), transparent 50%)`,
        }}
      />
    </motion.div>
  )
}
