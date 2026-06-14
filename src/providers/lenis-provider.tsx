"use client"
import { useEffect } from "react"
import { useLenis } from "@podium/ui/hooks"

/**
 * Mounts Lenis smooth scroll for the entire app and wires GSAP ScrollTrigger
 * to follow Lenis updates so reveal animations stay in sync.
 *
 * GSAP is imported lazily so the scroll-trigger plugin doesn't bloat first
 * paint on routes that don't use it.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useLenis()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ])
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      const lenis = new Lenis({ smoothWheel: true })
      lenis.on("scroll", ScrollTrigger.update)
      gsap.ticker.add((time) => lenis.raf(time * 1000))
      gsap.ticker.lagSmoothing(0)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return <>{children}</>
}
