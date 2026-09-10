"use client"
import { type CSSProperties } from "react"
import { cn } from "../lib/cn"

type MarqueeProps = {
  items: string[]
  /** Duration of one full loop in seconds. Higher = slower. */
  speed?: number
  separator?: string
  className?: string
  style?: CSSProperties
}

/**
 * Infinite horizontal marquee. The track is duplicated to create a seamless
 * loop; pausing on hover is wired via Tailwind's [animation-play-state] arbitrary.
 */
export function Marquee({
  items,
  speed = 40,
  separator = "✦",
  className,
  style,
}: MarqueeProps) {
  const block = (
    <span className="inline-flex items-center pr-20">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-20 pr-20 whitespace-nowrap">
          {item}
          <span className="text-accent italic">{separator}</span>
        </span>
      ))}
    </span>
  )

  return (
    <div className={cn("overflow-hidden whitespace-nowrap flex", className)} style={style}>
      <div
        className="inline-flex animate-marquee hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {block}
        {block}
      </div>
    </div>
  )
}
