import { type HTMLAttributes } from "react"
import { cn } from "../lib/cn"

/**
 * Small caps mono label used throughout the design — section eyebrows,
 * filter group titles, badges. Maps to the prototype's `.eyebrow` rule.
 */
export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-widest text-muted",
        className,
      )}
      {...props}
    />
  )
}
