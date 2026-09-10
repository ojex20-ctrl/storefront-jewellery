"use client"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { type ReactNode, useRef } from "react"
import { cn } from "../lib/cn"

type MagneticProps = {
  children: ReactNode
  /** 0 = no pull, 1 = follows cursor exactly. Around 0.15–0.3 looks best. */
  strength?: number
  className?: string
}

/**
 * Pulls the wrapped element toward the cursor when hovered. Replaces the
 * prototype's mouse-event handler with Framer Motion springs so the return-
 * to-rest motion is physically damped instead of a fixed CSS transition.
 */
export function Magnetic({ children, strength = 0.25, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY, display: "inline-block" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
