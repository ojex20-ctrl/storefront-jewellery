"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { useMarketingStore } from "@/stores/marketing-store"
import { OptimizedImage } from "@/components/media/optimized-image"

export function MarketingWidgets() {
  return (
    <>
      <ExitIntentPopup />
      <RecentPurchasePopup />
      <CountdownTimer />
      <AbandonedCartPing />
      <InstagramFeed />
    </>
  )
}

function ExitIntentPopup() {
  const dismissedAt = useMarketingStore((s) => s.exitPopupDismissedAt)
  const dismiss = useMarketingStore((s) => s.dismissExitPopup)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const recentlyDismissed = dismissedAt && Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000
    if (recentlyDismissed) return
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) setOpen(true)
    }
    document.addEventListener("mouseleave", onMouseLeave)
    return () => document.removeEventListener("mouseleave", onMouseLeave)
  }, [dismissedAt])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-black/50 px-4">
      <div className="relative w-[min(480px,100%)] border border-line bg-bg p-8 text-ink shadow-2xl">
        <button onClick={() => { dismiss(); setOpen(false) }} className="absolute right-4 top-4 text-muted hover:text-ink" aria-label="Close offer">
          <X size={18} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Before you go</p>
        <h2 className="mt-3 font-display text-4xl">Take 10% off your first SYRA order.</h2>
        <p className="mt-3 text-sm text-muted">Use code SYRA10 at checkout. Limited launch offer.</p>
        <Link onClick={() => { dismiss(); setOpen(false) }} href="/collection" className="mt-6 inline-block bg-accent px-6 py-3 font-mono text-[11px] uppercase tracking-widest text-bg">
          Shop now
        </Link>
      </div>
    </div>
  )
}

function RecentPurchasePopup() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(false)
  const events = ["Aarohi bought Crystal Earrings", "Meera bought a Gold Bracelet", "Nisha saved a Rose Gold Ring"]

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % events.length)
      setVisible(true)
      setTimeout(() => setVisible(false), 4800)
    }, 18000)
    return () => clearInterval(timer)
  }, [events.length])

  if (!visible) return null
  return (
    <div className="fixed bottom-24 left-4 z-[80] border border-line bg-bg px-4 py-3 text-sm text-ink shadow-xl">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Just now</p>
      <p>{events[idx]}</p>
    </div>
  )
}

function CountdownTimer() {
  const [left, setLeft] = useState("")
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      const ms = Math.max(0, end.getTime() - now.getTime())
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setLeft(`${h}h ${m}m ${s}s`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="fixed left-1/2 top-[70px] z-[70] hidden -translate-x-1/2 border border-line bg-bg/90 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink backdrop-blur md:block">
      Launch offer ends in {left}
    </div>
  )
}

function AbandonedCartPing() {
  const items = useCartStore((s) => s.items)
  useEffect(() => {
    if (items.length === 0) return
    const payload = {
      items: items.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })),
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
      capturedAt: Date.now(),
    }
    window.localStorage.setItem("syra-abandoned-cart", JSON.stringify(payload))
    const timer = window.setTimeout(() => {
      void fetch("/api/marketing/abandoned-cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [items])
  return null
}

function InstagramFeed() {
  const [items, setItems] = useState<Array<{ image: string; href: string; caption?: string }>>([])
  useEffect(() => {
    void fetch("/api/instagram")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
  }, [])
  if (items.length === 0) return null
  return (
    <section className="border-t border-line bg-bg px-6 py-14 text-ink md:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl">Seen On Instagram</h2>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-accent">
            Follow SYRA
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.slice(0, 4).map((item, index) => (
            <a key={`${item.image}-${index}`} href={item.href} target="_blank" rel="noreferrer" className="group">
              <div className="relative aspect-square overflow-hidden bg-bg-2">
                <OptimizedImage src={item.image} alt={item.caption ?? "SYRA Instagram post"} sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
              {item.caption && <p className="mt-2 text-sm text-muted">{item.caption}</p>}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
