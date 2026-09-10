"use client"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../lib/cn"

type SwatchProps = Omit<HTMLMotionProps<"button">, "color" | "type"> & {
  color: string
  active?: boolean
  size?: "sm" | "md" | "lg"
  label?: string
}

const sizes = {
  sm: "h-2.5 w-2.5",
  md: "h-6 w-6",
  lg: "h-9 w-9",
}

export function Swatch({ color, active, size = "md", label, className, ...rest }: SwatchProps) {
  return (
    <motion.button
      type="button"
      title={label ?? color}
      aria-label={label ?? color}
      animate={{ scale: active ? 1.1 : 1 }}
      whileHover={{ scale: 1.4 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "rounded-full border border-line-2 outline-offset-[3px] transition-colors",
        active && "outline outline-2 outline-accent",
        sizes[size],
        className,
      )}
      style={{ background: color }}
      {...rest}
    />
  )
}
