"use client"
import { useEffect, useRef } from "react"

type NoiseGrainProps = {
  opacity?: number
  className?: string
}

/**
 * Fixed animated film-grain layer rendered on canvas at low resolution
 * and stretched to cover the viewport. Adds organic texture over flat
 * colour fills — pairs well with the gradient mesh on the SYRA hero.
 *
 * Lightweight enough to mount once at app root. ~30fps to keep CPU low.
 */
export function NoiseGrain({ opacity = 0.06, className }: NoiseGrainProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    c.width = 180
    c.height = 180
    let raf = 0
    let last = 0

    const tick = (t: number) => {
      // Throttle to ~30fps; the eye doesn't notice grain at higher rates.
      if (t - last > 33) {
        const img = ctx.createImageData(c.width, c.height)
        for (let i = 0; i < img.data.length; i += 4) {
          const v = (Math.random() * 255) | 0
          img.data[i] = v
          img.data[i + 1] = v
          img.data[i + 2] = v
          img.data[i + 3] = 255
        }
        ctx.putImageData(img, 0, 0)
        last = t
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[1] h-full w-full ${className ?? ""}`}
      style={{
        opacity,
        mixBlendMode: "overlay",
        imageRendering: "pixelated",
      }}
    />
  )
}
