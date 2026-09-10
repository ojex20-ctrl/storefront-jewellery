"use client"
import { useEffect, useRef } from "react"

type GradientMeshProps = {
  /** Base hue (0–360). Animates around it. */
  hue?: number
  /** Mix-blend-mode for the canvas (default `screen` works on dark). */
  blend?: "screen" | "soft-light" | "color-dodge" | "overlay" | "normal"
  /** Pixel grid size — smaller = more detail but slower. */
  grid?: number
  className?: string
}

/**
 * Animated WebGL-free gradient mesh — three soft blobs orbiting on canvas2D
 * at low resolution, then upscaled by CSS for that y2k chrome-mesh look.
 *
 * Cheap (~60fps on integrated graphics), works in SSR-safe Suspense, and
 * doesn't pull a third-party library. Sits absolutely-positioned inside a
 * relative parent.
 */
export function GradientMesh({
  hue = 290,
  blend = "screen",
  grid = 110,
  className,
}: GradientMeshProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    let raf = 0
    const w = grid
    const h = grid
    c.width = w
    c.height = h

    const blobs = [
      { h: hue, x: 0.3, y: 0.4, r: 0.55 },
      { h: (hue + 60) % 360, x: 0.7, y: 0.3, r: 0.5 },
      { h: (hue + 200) % 360, x: 0.5, y: 0.8, r: 0.6 },
    ]

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      blobs.forEach((b, i) => {
        const phase = t * 0.0003 + i * 2.1
        const cx = (b.x + Math.cos(phase) * 0.18) * w
        const cy = (b.y + Math.sin(phase * 0.9) * 0.18) * h
        const r = b.r * w
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad.addColorStop(0, `hsla(${b.h}, 95%, 65%, 0.95)`)
        grad.addColorStop(1, `hsla(${b.h}, 95%, 50%, 0)`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [hue, grid])

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      style={{
        filter: "blur(38px) saturate(1.25)",
        mixBlendMode: blend,
        imageRendering: "pixelated",
      }}
    />
  )
}
