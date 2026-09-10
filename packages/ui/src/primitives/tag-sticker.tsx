import { type HTMLAttributes } from "react"
import { cn } from "../lib/cn"

type TagVariant = "new" | "hot" | "low" | "default"

type TagStickerProps = HTMLAttributes<HTMLSpanElement> & { variant?: TagVariant }

const variants: Record<TagVariant, string> = {
  default: "bg-accent text-ink",
  new: "bg-accent-3 text-ink",
  hot: "bg-accent text-bg",
  low: "bg-ink text-bg",
}

export function TagSticker({ variant = "default", className, children, ...rest }: TagStickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {variant === "hot" && <span aria-hidden>●</span>}
      {children}
    </span>
  )
}
