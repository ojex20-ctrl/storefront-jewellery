"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Reveal, Magnetic, Sparkles } from "@podium/ui/motion"
import { Button, Eyebrow, Placeholder, ProductGallery, TagSticker } from "@podium/ui/primitives"
import { RentalRequestModal } from "@podium/ui/chrome"
import { priceFmt } from "@podium/ui/lib"
import { useCartStore } from "@/stores/cart-store"
import { useAuthStore } from "@/stores/auth-store"
import {
  STONE_HEX,
  METAL_NOTES,
  toCartLine,
  type Metal,
  type Mode,
  type Product,
  type Stone,
} from "@/lib/products"
import { ProductCard } from "@/components/product/product-card"

const VIEWS = ["MAIN", "MACRO", "ON-FIGURE"] as const
const VIEW_3D = "3D" as const

const tagVariant: Record<string, "new" | "hot" | "low" | "default"> = {
  NEW: "new",
  BESTSELLER: "default",
  "ONE OF ONE": "hot",
  "LOW STOCK": "low",
}

type Props = { product: Product; related: Product[] }

export function ProductDetailClient({ product, related }: Props) {
  const params = useSearchParams()
  const add = useCartStore((s) => s.add)
  const customer = useAuthStore((s) => s.customer)
  const [metal, setMetal] = useState<Metal>(product.metals[0] ?? "Sterling")
  const [stone, setStone] = useState<Stone>(product.stones[0] ?? "None")
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null)
  const [active, setActive] =
    useState<typeof VIEWS[number] | typeof VIEW_3D>("MAIN")
  // Deep-link: /products/j1?mode=rent pre-selects rent + opens modal.
  const initialMode: Mode =
    params.get("mode") === "rent" && product.rental.enabled ? "rent" : "buy"
  const [mode, setMode] = useState<Mode>(initialMode)
  const [rentalModalOpen, setRentalModalOpen] = useState(false)

  useEffect(() => {
    setMetal(product.metals[0] ?? "Sterling")
    setStone(product.stones[0] ?? "None")
    setSize(product.sizes[0] ?? null)
    setActive(product.modelPath ? VIEW_3D : "MAIN")
    const wantsRent = params.get("mode") === "rent" && product.rental.enabled
    setMode(wantsRent ? "rent" : "buy")
    if (wantsRent) setRentalModalOpen(true)
  }, [product.id, product.metals, product.stones, product.sizes, product.modelPath, product.rental.enabled, params])

  const onAdd = () => {
    // Rentals never hit the cart — opens the request modal instead.
    if (mode === "rent") {
      setRentalModalOpen(true)
      return
    }
    if (product.sizes.length > 0 && !size) {
      toast.error("Choose a size to continue")
      return
    }
    add(toCartLine(product, metal, stone, size))
    toast.success(`${product.name} · ${metal}${stone !== "None" ? ` · ${stone}` : ""}`)
  }

  return (
    <div className="bg-bg text-ink min-h-screen">
      {/* ─── BREADCRUMBS ────────────────────────────────────────────── */}
      <div className="px-6 py-8 md:px-12">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted space-x-2">
          <Link href="/" className="hover:text-accent">Home</Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-accent">Collection</Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <section className="flex flex-col md:flex-row px-6 md:px-12 gap-12 lg:gap-24">
        {/* ─── LEFT: VERTICAL GALLERY ─── */}
        <div className="flex-1 space-y-6 md:space-y-12 pb-12">
          {product.gallery.map((src, i) => (
            <motion.div 
              key={src}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="aspect-[3/4] bg-bg-2 overflow-hidden"
            >
              <Placeholder 
                image={src} 
                className="h-full w-full object-cover grayscale-[5%] hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                alt={`${product.name} view ${i + 1}`}
              />
            </motion.div>
          ))}
        </div>

        {/* ─── RIGHT: STICKY INFO ─── */}
        <div className="md:w-[400px] lg:w-[480px]">
          <div className="md:sticky md:top-[120px] space-y-10 pb-20">
            <Reveal>
              <Eyebrow className="text-accent mb-4 block">{product.kind} · SYRA</Eyebrow>
              <h1 className="font-display text-4xl md:text-6xl tracking-tight leading-[1.1] mb-6">
                {product.name}
              </h1>
              <p className="font-mono text-lg tracking-widest uppercase">
                {priceFmt(product.price)}
              </p>
            </Reveal>

            <Reveal>
              <div className="space-y-8">
                {/* Metal Selector */}
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-4">Material</span>
                  <div className="flex flex-wrap gap-2">
                    {product.metals.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMetal(m)}
                        className={`border px-5 py-2 font-mono text-[10px] uppercase tracking-widest transition-all ${
                          metal === m
                            ? "border-ink bg-ink text-bg"
                            : "border-line hover:border-ink"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stone Selector */}
                {product.stones.filter(s => s !== "None").length > 0 && (
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-4">Stone</span>
                    <div className="flex flex-wrap gap-3">
                      {product.stones.map((s) => (
                        <button
                          key={s}
                          onClick={() => setStone(s)}
                          className={`flex items-center gap-2 border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all ${
                            stone === s ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full" style={{ background: STONE_HEX[s] }} />
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart */}
                <div className="pt-6">
                  <button 
                    onClick={onAdd}
                    className="w-full bg-ink text-bg py-5 font-mono text-[11px] uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="space-y-8 pt-12 border-t border-line">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-3">Details</span>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    {product.desc}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-3">Composition</span>
                  <p className="text-xs text-muted leading-relaxed">
                    {METAL_NOTES[metal]}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* RELATED */}
      {related.length > 0 && (
        <section className="border-t border-line px-4 py-20 md:px-12 md:py-28">
          <Eyebrow className="mb-6 block text-accent">Related</Eyebrow>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-8">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* RENTAL REQUEST MODAL */}
      {product.rental.enabled && (
        <RentalRequestModal
          open={rentalModalOpen}
          onClose={() => setRentalModalOpen(false)}
          brand="jewellery"
          backend={process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"}
          publishableKey={process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""}
          formatPrice={priceFmt}
          ctaLabel="Send rental request"
          defaultCustomer={
            customer
              ? {
                  name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || undefined,
                  email: customer.email,
                }
              : undefined
          }
          product={{
            id: product.id,
            handle: product.id,
            title: product.name,
            variant_title: [metal, stone !== "None" ? stone : null, size].filter(Boolean).join(" / ") || undefined,
            image: product.image,
            daily_rate: product.rental.daily_rate,
            security_deposit: product.rental.security_deposit,
            durations: product.rental.durations,
            notes: product.rental.notes,
          }}
        />
      )}
    </div>
  )
}
