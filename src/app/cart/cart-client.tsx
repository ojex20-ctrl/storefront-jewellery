"use client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button, Eyebrow, Placeholder } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"

const FREE_SHIPPING_OVER = 99900 // ₹999 in paise
const STANDARD_RATE = 4900 // ₹49

export function CartClient() {
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping = subtotal >= FREE_SHIPPING_OVER || subtotal === 0 ? 0 : STANDARD_RATE
  const total = subtotal + shipping
  const remaining = Math.max(0, FREE_SHIPPING_OVER - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100)

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-70px)] max-w-[600px] flex-col items-center justify-center px-6 text-center">
        <Eyebrow className="mb-3 block">Your bag</Eyebrow>
        <p className="mb-4 font-display tracking-tighter" style={{ fontSize: "clamp(56px, 9vw, 96px)" }}>
          Nothing here <em>yet</em>.
        </p>
        <p className="mb-8 max-w-[380px] text-sm leading-relaxed text-muted">
          Discover anti-tarnish pieces made to be worn every day. Add something you love.
        </p>
        <Link href="/collection"><Button>Explore the collection →</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
      <Eyebrow className="mb-2 block">Your bag</Eyebrow>
      <p className="mb-10 font-display tracking-tighter" style={{ fontSize: "clamp(44px, 6vw, 76px)" }}>
        {items.reduce((s, i) => s + i.qty, 0)} <em>pieces</em>.
      </p>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Line items */}
        <div>
          {/* Free shipping progress */}
          <div className="mb-8 border border-line p-5">
            <div className="mb-2.5 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
              <span className={remaining === 0 ? "text-accent" : "text-muted"}>
                {remaining === 0 ? "✓ You've unlocked free shipping" : `${priceFmt(remaining)} away from free shipping`}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>

          <div className="border-t border-line">
            <AnimatePresence initial={false}>
              {items.map((item, idx) => (
                <motion.div
                  key={item.lineId}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-[88px_1fr] items-start gap-4 overflow-hidden border-b border-line py-6 md:grid-cols-[110px_1fr_auto]"
                >
                  <Link href={`/products/${item.productId}`} className="block">
                    <Placeholder
                      image={item.image}
                      tint={(((idx % 5) + 1) as 1 | 2 | 3 | 4 | 5)}
                      label={item.productId.toUpperCase()}
                      className="aspect-[4/5]"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link href={`/products/${item.productId}`}>
                      <p className="font-display text-2xl leading-tight hover:text-accent">{item.name}</p>
                    </Link>
                    <Eyebrow className="mt-1 block">{item.category}{item.size ? ` · ${item.size}` : ""}</Eyebrow>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="inline-flex items-center border border-line">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty(item.lineId, item.qty - 1)}
                          className="px-3 py-1.5 text-lg leading-none text-muted transition-colors hover:text-ink"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center font-mono text-sm">{item.qty}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty(item.lineId, item.qty + 1)}
                          className="px-3 py-1.5 text-lg leading-none text-muted transition-colors hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.lineId)}
                        className="font-mono text-[10px] uppercase tracking-widest text-muted underline transition-colors hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-baseline justify-between md:col-span-1 md:block md:text-right">
                    <span className="font-mono text-sm md:text-base">{priceFmt(item.price * item.qty)}</span>
                    {item.qty > 1 && (
                      <span className="ml-2 block font-mono text-[11px] text-muted md:mt-1 md:ml-0">
                        {priceFmt(item.price)} each
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8">
            <Link href="/collection" className="ulink font-mono text-[11px] uppercase tracking-widest text-muted">
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-[90px] lg:self-start">
          <div className="border border-line bg-bg-2 p-7 md:p-8">
            <Eyebrow className="mb-5 block">Summary</Eyebrow>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-mono">{priceFmt(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-muted">Shipping</span>
              <span className="font-mono">{shipping === 0 ? "FREE" : `est. ${priceFmt(shipping)}`}</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-display text-2xl">Total</span>
              <span className="font-mono text-xl">{priceFmt(total)}</span>
            </div>
            <p className="mt-2 text-[11px] text-muted">Taxes included. Promo codes apply at checkout.</p>

            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full justify-center">Proceed to checkout →</Button>
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-muted">
              <span>✓ Secure Razorpay</span>
              <span>✓ 2-yr anti-tarnish</span>
              <span>✓ Easy returns</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
