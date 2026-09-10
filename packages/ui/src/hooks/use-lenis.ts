"use client"
import { useEffect } from "react"

type LenisInstance = {
  raf(time: number): void
  destroy(): void
  on(event: string, cb: (...args: unknown[]) => void): void
}

type LenisOptions = {
  duration?: number
  easing?: (t: number) => number
  smoothWheel?: boolean
  wheelMultiplier?: number
  touchMultiplier?: number
}

/**
 * Mounts a Lenis smooth-scroll instance for the duration of the component.
 * Lenis is dynamically imported so SSR doesn't try to touch `window`.
 *
 * Pairs with GSAP ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)`.
 */
export function useLenis(options?: LenisOptions): void {
  useEffect(() => {
    let lenis: LenisInstance | null = null
    let rafId = 0
    let cancelled = false

    void (async () => {
      type LenisModule = { default: new (opts?: LenisOptions) => LenisInstance }
      const mod = (await import("lenis")) as unknown as LenisModule
      if (cancelled) return
      lenis = new mod.default({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        ...options,
      })

      const tick = (time: number) => {
        lenis?.raf(time)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      lenis?.destroy()
    }
  }, [options])
}
