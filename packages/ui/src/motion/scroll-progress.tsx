"use client"
import { motion, useScroll, useSpring } from "framer-motion"

/**
 * 2px progress bar fixed at the top of the viewport. Driven by Framer Motion's
 * useScroll so it stays in sync with Lenis-smoothed scrolling.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[100] h-[2px] origin-left bg-accent"
      aria-hidden="true"
    />
  )
}
