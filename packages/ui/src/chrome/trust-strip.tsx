"use client"
import { motion } from "framer-motion"

type Item = {
  /** Optional emoji/icon shown left of the headline (single character recommended). */
  icon?: string
  headline: string
  sub: string
}

type Props = {
  items: Item[]
  className?: string
}

/**
 * Trust strip — three to four short value props, surfaced just above or
 * below the hero. Borrowed from rosywine.in's "trusted by 2 lakh+
 * customers" treatment but kept brand-neutral via CSS vars.
 */
export function TrustStrip({ items, className }: Props) {
  return (
    <section
      className={`grid grid-cols-2 gap-px border-y border-line bg-line md:grid-cols-${Math.min(
        items.length,
        4,
      )} ${className ?? ""}`}
    >
      {items.map((it, i) => (
        <motion.div
          key={`${it.headline}-${i}`}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, delay: i * 0.05 }}
          className="flex flex-col items-center gap-1 bg-bg p-5 text-center md:p-7"
        >
          {it.icon && <span className="text-2xl">{it.icon}</span>}
          <p className="font-display text-xl tracking-tight md:text-2xl">{it.headline}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {it.sub}
          </p>
        </motion.div>
      ))}
    </section>
  )
}
