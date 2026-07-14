"use client"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { isValidEmail } from "@/lib/validation"

export function NewsletterSignup({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) { toast.error("Enter a valid email."); return }
    setBusy(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not subscribe")
      setDone(true)
      toast.success(data.message ?? "You're subscribed.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="border-t border-line px-4 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[620px] text-center">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">The list</p>
        <h2 className="mb-4 font-display tracking-tighter" style={{ fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 0.95 }}>
          Quiet dispatches, <em>new drops</em>.
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          Be first to know when new anti-tarnish pieces land. No noise — just the good stuff.
        </p>
        {done ? (
          <p className="font-mono text-[12px] uppercase tracking-widest text-accent">✓ You&apos;re on the list</p>
        ) : (
          <form onSubmit={submit} className="mx-auto flex max-w-[440px] gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border-b border-line bg-transparent py-3 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy}
              className="shrink-0 bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
