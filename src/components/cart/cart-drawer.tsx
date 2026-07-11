"use client"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button, Eyebrow, Placeholder } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { useBrand } from "@/providers/brand-provider"

/** Perfume bottles don't get a Pantone-style colour name; chip + volume is enough. */
const colorName = (_hex: string) => "Flacon"

/**
 * Slide-over cart. Wired to `useCartStore`. Auto-opens via the store's
 * `add()` action so the user gets instant feedback when something lands.
 */
export function CartDrawer() {
  const open = useCartStore((s) => s.open)
  const setOpen = useCartStore((s) => s.setOpen)
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const router = useRouter()
  const brand = useBrand()
  const FREE_SHIPPING_THRESHOLD = brand.free_shipping_threshold

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const depositTotal = items.reduce((s, i) => s + (i.rental?.security_deposit ?? 0) * i.qty, 0)
  const shipping = subtotal === 0 || subtotal > FREE_SHIPPING_THRESHOLD ? 0 : 30
  const total = subtotal + shipping + depositTotal
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1) * 100
  const totalQty = items.reduce((n, i) => n + i.qty, 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-y-0 right-0 z-[101] flex w-[min(500px,100vw)] flex-col border-l border-line bg-bg shadow-[-30px_0_60px_rgba(0,0,0,0.1)]"
            style={{
              backgroundImage: [
                "radial-gradient(500px 400px at 0% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%)",
                "radial-gradient(500px 400px at 100% 100%, color-mix(in srgb, var(--accent-2, var(--accent)) 18%, transparent), transparent 60%)",
              ].join(","),
              backgroundRepeat: "no-repeat",
            }}
          >
            <header className="flex items-center justify-between border-b border-line p-6">
              <div>
                <h2 className="font-display text-4xl leading-none tracking-tight">Bag</h2>
                <Eyebrow className="mt-1.5 block">
                  {items.length} item{items.length !== 1 && "s"} · {totalQty} pieces
                </Eyebrow>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="font-mono text-[11px] uppercase tracking-widest hover:text-accent"
              >
                Close ×
              </button>
            </header>

            {items.length > 0 && (
              <div className="border-b border-line px-6 py-3">
                <div
                  className={`mb-1.5 font-mono text-[10px] uppercase tracking-widest ${
                    progress >= 100 ? "text-accent" : "text-muted"
                  }`}
                >
                  {progress >= 100
                    ? "✓ Free shipping unlocked"
                    : `Add ${priceFmt(FREE_SHIPPING_THRESHOLD - subtotal)} for free shipping`}
                </div>
                <div className="relative h-0.5 overflow-hidden bg-bg-2">
                  <motion.div
                    className={`absolute inset-y-0 left-0 ${
                      progress >= 100 ? "bg-accent-3" : "bg-accent"
                    }`}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="mb-2 font-display text-[56px] leading-none tracking-tight">
                    <em>Empty.</em>
                  </p>
                  <Eyebrow className="mb-6 block">Nothing here yet.</Eyebrow>
                  <Button
                    onClick={() => {
                      setOpen(false)
                      router.push("/collection")
                    }}
                  >
                    Explore the collection
                  </Button>
                </div>
              ) : (
                items.map((item, idx) => (
                  <motion.div
                    key={item.lineId}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    className="grid grid-cols-[100px_1fr] gap-4 border-b border-line p-6"
                  >
                    <Placeholder
                      image={item.image}
                      tint={(((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5)}
                      label={item.productId.toUpperCase()}
                      className="aspect-[4/5]"
                    />
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-display text-xl">{item.name}</p>
                            <Eyebrow className="mt-0.5 block">{item.category}</Eyebrow>
                          </div>
                          <span className="font-mono text-xs">
                            {priceFmt(item.price * item.qty)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wide text-muted">
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block h-2 w-2 rounded-full border border-line-2"
                              style={{ background: item.color }}
                            />
                            {colorName(item.color)}
                          </span>
                          <span>· Size {item.size}</span>
                        </div>
                        {item.rental && (
                          <div className="mt-2 inline-block bg-accent-soft px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-accent">
                            Rental · {new Date(item.rental.start_date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                            {" → "}
                            {new Date(item.rental.end_date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                            {" · "}
                            {item.rental.days}d
                            <br />
                            <span className="text-muted">
                              + {priceFmt(item.rental.security_deposit)} refundable deposit
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center border border-line">
                          <button
                            onClick={() => setQty(item.lineId, item.qty - 1)}
                            className="px-3 py-1.5 font-mono text-xs hover:text-accent"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-6 px-3 py-1.5 text-center font-mono text-xs">
                            <motion.span
                              key={item.qty}
                              initial={{ y: -8, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.25 }}
                              className="inline-block"
                            >
                              {item.qty}
                            </motion.span>
                          </span>
                          <button
                            onClick={() => setQty(item.lineId, item.qty + 1)}
                            className="px-3 py-1.5 font-mono text-xs hover:text-accent"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.lineId)}
                          className="ulink font-mono text-[10px] uppercase tracking-widest text-muted"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-line bg-bg-2 p-6">
                <Row label="Subtotal" value={priceFmt(subtotal)} />
                {depositTotal > 0 && (
                  <Row label="Refundable deposit" value={priceFmt(depositTotal)} />
                )}
                <Row label="Shipping" value={shipping === 0 ? "FREE" : priceFmt(shipping)} />
                <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
                  <span className="font-display text-[22px]">Total</span>
                  <span className="font-mono text-lg">{priceFmt(total)}</span>
                </div>
                <Link href="/checkout" className="mt-5 block" onClick={() => setOpen(false)}>
                  <Button className="w-full" size="lg">
                    Checkout →
                  </Button>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="mt-3 block text-center font-mono text-[10px] uppercase tracking-widest text-muted underline"
                >
                  View full bag
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
