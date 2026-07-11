"use client"
import Link from "next/link"
import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Something slipped</p>
      <h1 className="mb-4 font-display tracking-tighter" style={{ fontSize: "clamp(48px, 8vw, 96px)", lineHeight: 0.95 }}>
        A little <em>tarnish</em>.
      </h1>
      <p className="mb-8 max-w-[420px] text-sm leading-relaxed text-muted">
        We hit an unexpected error rendering this page. Try again, or head back to the collection.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-bg transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/collection"
          className="border border-line px-6 py-3 font-mono text-[11px] uppercase tracking-widest transition-colors hover:border-ink"
        >
          Explore the collection
        </Link>
      </div>
    </div>
  )
}
