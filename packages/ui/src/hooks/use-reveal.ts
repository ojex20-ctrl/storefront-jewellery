"use client"
import { useEffect, useRef, useState } from "react"

/**
 * IntersectionObserver-driven "reveal on scroll" hook with a 1.2s safety
 * fallback so reveals never get stuck off-screen on slow devices.
 */
export function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (shown) return
    const el = ref.current
    if (!el) return

    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight && r.bottom > 0) {
      setShown(true)
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(el)
    const t = window.setTimeout(() => setShown(true), 1200)
    return () => {
      obs.disconnect()
      window.clearTimeout(t)
    }
  }, [shown, threshold])

  return [ref, shown] as const
}
