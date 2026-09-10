import { cn } from "../lib/cn"

export function LiveDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-2 w-2 rounded-full bg-accent animate-pulse-dot",
        className,
      )}
    />
  )
}
