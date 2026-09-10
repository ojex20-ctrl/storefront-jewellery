"use client"
import { motion } from "framer-motion"
import { cn } from "../lib/cn"

type Gender = "men" | "women"

type Props = {
  value: Gender
  onChange: (g: Gender) => void
  className?: string
}

export function GenderToggle({ value, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "relative inline-flex rounded-full border border-line-2 p-0.5 font-mono text-[10px] uppercase tracking-wider",
        className,
      )}
    >
      <motion.span
        className="absolute top-0.5 bottom-0.5 rounded-full bg-ink"
        animate={{ left: value === "men" ? "2px" : "calc(50% + 0px)", right: value === "men" ? "calc(50% + 0px)" : "2px" }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        aria-hidden
      />
      {(["men", "women"] as const).map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={cn(
            "relative z-10 rounded-full px-3.5 py-1.5 transition-colors duration-300",
            value === g ? "text-bg" : "text-muted",
          )}
        >
          {g === "men" ? "Men" : "Women"}
        </button>
      ))}
    </div>
  )
}
