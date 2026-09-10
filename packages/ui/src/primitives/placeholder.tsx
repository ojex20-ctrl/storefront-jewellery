"use client"
import Image from "next/image"
import { type CSSProperties } from "react"
import { cn } from "../lib/cn"
import { assetUrl } from "../lib/asset"

type PlaceholderProps = {
  /** Sourced image. Falls back to tinted hatch background when undefined. */
  image?: string
  /** Caption shown in the bottom-left chip. */
  label?: string
  /** Background tint variant (1–5) used when no image is provided. */
  tint?: 1 | 2 | 3 | 4 | 5
  className?: string
  style?: CSSProperties
  /** When true, renders a Next.js Image with fill behaviour. */
  optimize?: boolean
  alt?: string
  priority?: boolean
}

const tintBg: Record<number, string> = {
  1: "linear-gradient(135deg, var(--accent-soft), var(--bg))",
  2: "linear-gradient(135deg, #e8edff, var(--bg))",
  3: "linear-gradient(135deg, #f4f8d8, var(--bg))",
  4: "linear-gradient(135deg, #ffe1ec, var(--bg))",
  5: "linear-gradient(135deg, #d8e8db, var(--bg))",
}

/**
 * Image-or-tinted-rectangle slot used everywhere a product photo lives.
 * When `optimize` is on we use next/image with fill; the parent must be
 * `relative` and have a defined size.
 */
export function Placeholder({
  image,
  label,
  tint,
  className,
  style,
  optimize = false,
  alt,
  priority,
}: PlaceholderProps) {
  // Route through the asset CDN when configured, fall back to local public/ otherwise.
  const resolved = image ? assetUrl(image) : undefined
  if (resolved && optimize) {
    return (
      <div className={cn("relative overflow-hidden border border-line", className)} style={style}>
        <Image
          src={resolved}
          alt={alt ?? label ?? ""}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
          priority={priority}
        />
        {label && (
          <span className="absolute bottom-2.5 left-2.5 border border-line bg-bg px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
            {label}
          </span>
        )}
      </div>
    )
  }

  if (resolved) {
    return (
      <div
        role="img"
        aria-label={alt ?? label}
        className={cn(
          "relative overflow-hidden border border-line bg-cover bg-center",
          className,
        )}
        style={{ ...style, backgroundImage: `url(${resolved})` }}
      >
        {label && (
          <span className="absolute bottom-2.5 left-2.5 border border-line bg-bg px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
            {label}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden border border-line",
        className,
      )}
      style={{
        ...style,
        background: tint
          ? tintBg[tint]
          : "repeating-linear-gradient(135deg, var(--bg-2) 0, var(--bg-2) 12px, transparent 12px, transparent 24px), var(--bg)",
      }}
    >
      {label && (
        <span className="m-2.5 border border-line bg-bg px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
          {label}
        </span>
      )}
    </div>
  )
}
