"use client"
import { motion, type Variants, type HTMLMotionProps } from "framer-motion"
import { type ReactNode } from "react"
import { cn } from "../lib/cn"

type RevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode
  /** Stagger child reveals when true. Children must be direct elements. */
  stagger?: boolean
  /** Reveal earlier/later by adjusting amount in viewport. */
  amount?: number
  /** Translate distance in px. */
  distance?: number
  className?: string
}

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const item = (distance: number): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.2, 0.8, 0.2, 1] },
  },
})

/**
 * Scroll-triggered reveal block. Replaces the prototype's IntersectionObserver
 * `<Reveal>` component using Framer Motion's whileInView for hardware-accelerated
 * transforms. Set `stagger` to fan children in sequentially.
 */
export function Reveal({
  children,
  stagger = false,
  amount = 0.15,
  distance = 30,
  className,
  ...rest
}: RevealProps) {
  if (stagger) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount }}
        variants={containerStagger}
        className={cn(className)}
        {...rest}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div key={i} variants={item(distance)}>
                {child}
              </motion.div>
            ))
          : <motion.div variants={item(distance)}>{children}</motion.div>}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
