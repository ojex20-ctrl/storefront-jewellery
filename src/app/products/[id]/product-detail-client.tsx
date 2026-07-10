"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { RentalRequestModal } from "@podium/ui/chrome"
import { priceFmt } from "@podium/ui/lib"
import { ProductActions } from "@/components/commerce/product-actions"
import { FrequentlyBoughtTogether, CompleteTheLook } from "@/components/commerce/merchandising-sections"
import { AIRecommendations } from "@/components/commerce/ai-recommendations"
import { RecentlyViewed } from "@/components/commerce/recently-viewed"
import { StickyAddToCart } from "@/components/commerce/sticky-add-to-cart"
import { BackInStock } from "@/components/commerce/back-in-stock"
import { OptimizedImage } from "@/components/media/optimized-image"
import { useCartStore } from "@/stores/cart-store"
import { useAuthStore } from "@/stores/auth-store"
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store"
import {
  METAL_NOTES,
  STONE_HEX,
  toCartLine,
  type Metal,
  type Mode,
  type Product,
  type Stone,
} from "@/lib/products"

type Props = { product: Product; related: Product[] }

function uniqueImages(product: Product) {
  const seen = new Set<string>()
  return [product.image, ...(product.gallery ?? []), ...(product.images ?? [])]
    .map((src) => src?.trim())
    .filter((src): src is string => Boolean(src))
    .filter((src) => {
      if (seen.has(src)) return false
      seen.add(src)
      return true
    })
}

function isOutOfStock(product: Product) {
  const labels = [product.tag, ...(product.tags ?? [])].filter(Boolean).join(" ")
  return /out of stock|sold out|unavailable/i.test(labels)
}

function usefulDescription(product: Product) {
  return product.desc?.trim() || product.caption?.trim() || `${product.name} is a SYRA ${product.kind.toLowerCase()} designed for everyday styling.`
}

export function ProductDetailClient({ product, related }: Props) {
  const params = useSearchParams()
  const add = useCartStore((s) => s.add)
  const customer = useAuthStore((s) => s.customer)
  const trackViewed = useRecentlyViewedStore((s) => s.track)

  const gallery = useMemo(() => uniqueImages(product), [product])
  const unavailable = isOutOfStock(product)
  const hasRingSizes = product.kind === "Ring" && product.sizes.length > 0
  const [activeImg, setActiveImg] = useState(0)
  const [metal, setMetal] = useState<Metal>((product.metals[0] as Metal | undefined) ?? "Sterling")
  const [stone, setStone] = useState<Stone>((product.stones[0] as Stone | undefined) ?? "None")
  const [size, setSize] = useState<string | null>(hasRingSizes ? product.sizes[0] ?? null : null)
  const [qty, setQty] = useState(1)
  const [openSection, setOpenSection] = useState<string>("details")
  const initialMode: Mode = params.get("mode") === "rent" && product.rental.enabled ? "rent" : "buy"
  const [mode, setMode] = useState<Mode>(initialMode)
  const [rentalModalOpen, setRentalModalOpen] = useState(false)

  useEffect(() => {
    setMetal((product.metals[0] as Metal | undefined) ?? "Sterling")
    setStone((product.stones[0] as Stone | undefined) ?? "None")
    setSize(product.kind === "Ring" ? product.sizes[0] ?? null : null)
    setActiveImg(0)
    setQty(1)
    const wantsRent = params.get("mode") === "rent" && product.rental.enabled
    setMode(wantsRent ? "rent" : "buy")
    if (wantsRent) setRentalModalOpen(true)
  }, [product.id, product.kind, product.metals, product.stones, product.sizes, product.rental.enabled, params])

  useEffect(() => {
    trackViewed({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      kind: product.kind,
    })
  }, [product.id, product.name, product.image, product.price, product.kind, trackViewed])

  const addToCart = () => {
    if (unavailable) return
    if (mode === "rent") {
      setRentalModalOpen(true)
      return
    }
    if (hasRingSizes && !size) {
      toast.error("Choose a ring size")
      return
    }
    for (let i = 0; i < qty; i += 1) add(toCartLine(product, metal, stone, size))
    toast.success(`${product.name} added to bag`)
  }

  const description = usefulDescription(product)
  const material = product.material || product.metals.join(", ") || "Anti-tarnish plated jewellery"
  const compareAt = product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice : null
  const qualifiesMysteryGift = product.price >= 59900
  const qualifiesOrganiser = product.price >= 199900

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      <div className="border-b border-gray-100 px-5 py-4 md:px-12">
        <nav className="flex flex-wrap items-center gap-2 text-[12px] text-gray-500">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href={`/collection?kind=${encodeURIComponent(product.kind)}`} className="hover:text-black">{product.kind}</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-5 py-6 md:grid-cols-[minmax(0,1fr)_440px] md:px-12 md:py-10 lg:gap-12">
        <div className="min-w-0">
          <div className="grid gap-3 md:grid-cols-[76px_minmax(0,1fr)] md:gap-4">
            {gallery.length > 1 && (
              <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
                {gallery.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden border bg-gray-50 md:h-[76px] md:w-[76px] ${
                      activeImg === index ? "border-black" : "border-gray-200"
                    }`}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <OptimizedImage src={src} alt={`${product.name} thumbnail ${index + 1}`} sizes="76px" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative order-1 aspect-[4/5] overflow-hidden bg-gray-50 md:order-2">
              <OptimizedImage
                src={gallery[activeImg] ?? product.image}
                alt={product.name}
                sizes="(max-width: 768px) 100vw, 58vw"
                priority
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">{product.kind}</p>
                <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight md:text-4xl">{product.name}</h1>
              </div>
              <ProductActions productId={product.id} />
            </div>

            {product.caption && <p className="text-sm leading-6 text-gray-600">{product.caption}</p>}

            <div className="flex flex-wrap items-end gap-3">
              <span className="text-2xl font-semibold">{priceFmt(product.price)}</span>
              {compareAt && <span className="pb-1 text-sm text-gray-400 line-through">{priceFmt(compareAt)}</span>}
              <span className={`pb-1 text-xs uppercase tracking-widest ${unavailable ? "text-red-600" : "text-emerald-700"}`}>
                {unavailable ? "Out of stock" : product.tag === "LOW STOCK" ? "Low stock" : "In stock"}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-y border-gray-100 py-5">
            {product.metals.length > 0 && (
              <OptionGroup label="Color / finish">
                {product.metals.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMetal(item)}
                    className={`border px-4 py-2 text-xs transition ${metal === item ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"}`}
                  >
                    {item}
                  </button>
                ))}
              </OptionGroup>
            )}

            {product.stones.filter((item) => item !== "None").length > 0 && (
              <OptionGroup label="Stone">
                {product.stones.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStone(item)}
                    className={`inline-flex items-center gap-2 border px-4 py-2 text-xs transition ${stone === item ? "border-black" : "border-gray-300 hover:border-black"}`}
                  >
                    <span className="h-3 w-3 rounded-full border" style={{ background: STONE_HEX[item] }} />
                    {item}
                  </button>
                ))}
              </OptionGroup>
            )}

            {hasRingSizes && (
              <OptionGroup label="Ring size">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    className={`h-10 min-w-10 border px-3 text-sm transition ${size === item ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"}`}
                  >
                    {item}
                  </button>
                ))}
              </OptionGroup>
            )}

            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-gray-500">Quantity</p>
              <div className="inline-grid grid-cols-[40px_48px_40px] items-center border border-gray-300">
                <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} className="h-10 text-lg hover:bg-gray-50" aria-label="Decrease quantity">-</button>
                <span className="text-center text-sm font-medium">{qty}</span>
                <button type="button" onClick={() => setQty((value) => value + 1)} className="h-10 text-lg hover:bg-gray-50" aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addToCart}
            disabled={unavailable}
            className="w-full bg-black px-6 py-4 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
          >
            {unavailable ? "Out of Stock" : "Add to Cart"}
          </button>

          {unavailable && <BackInStock productId={product.id} />}

          <div className="space-y-2 border border-gray-200 p-4">
            <p className="text-sm">Free shipping over {priceFmt(500)}</p>
            {qualifiesMysteryGift && <p className="text-sm">Gift offer available for this product.</p>}
            {qualifiesOrganiser && <p className="text-sm">Premium organiser offer available at checkout.</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2">
            <InfoTile label="Material" value={material} />
            <InfoTile label="Category" value={product.subcategory ? `${product.kind} / ${product.subcategory}` : product.kind} />
            <InfoTile label="Anti-tarnish" value={product.warranty || "Anti-tarnish finish for everyday wear."} />
            <InfoTile label="Shipping" value="Ships after order confirmation. Returns follow the published SYRA policy." />
          </div>

          <Accordion title="Description" open={openSection === "details"} onClick={() => setOpenSection(openSection === "details" ? "" : "details")}>
            <p>{description}</p>
            <p>{METAL_NOTES[metal] ?? "Finished for daily wear with a protective anti-tarnish layer."}</p>
          </Accordion>

          <Accordion title="Care, shipping and returns" open={openSection === "care"} onClick={() => setOpenSection(openSection === "care" ? "" : "care")}>
            <p>Store separately in a dry pouch after wear. Wipe gently with a soft cloth and avoid perfumes, harsh cleaners, and prolonged contact with chlorinated water.</p>
            <p>Shipping is calculated at checkout. Returns and exchanges follow the current SYRA policy for eligible unused pieces.</p>
          </Accordion>

          <Accordion title="FAQ" open={openSection === "faq"} onClick={() => setOpenSection(openSection === "faq" ? "" : "faq")}>
            <p><strong>Is this anti-tarnish?</strong><br />Yes. This piece is finished for daily wear with an anti-tarnish protective layer.</p>
            <p><strong>Which size should I choose?</strong><br />For rings, choose your usual ring size from the available size options. For other jewellery, check the product description and size guide.</p>
            <p><strong>Can I return it?</strong><br />Eligible unused products can be returned according to the published SYRA returns policy.</p>
          </Accordion>
        </div>
      </section>

      <FrequentlyBoughtTogether product={product} related={related} />
      <AIRecommendations productId={product.id} />
      <CompleteTheLook product={product} related={related} />
      <RecentlyViewed excludeId={product.id} />
      <StickyAddToCart product={product} metal={metal} stone={stone} size={size} disabled={unavailable} />

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

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 leading-5 text-black">{value}</p>
    </div>
  )
}

function Accordion({
  title,
  open,
  onClick,
  children,
}: {
  title: string
  open: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200">
      <button type="button" onClick={onClick} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium">
        {title}
        <span className="text-gray-400">{open ? "-" : "+"}</span>
      </button>
      {open && <div className="space-y-3 border-t border-gray-100 px-4 py-4 text-sm leading-6 text-gray-600">{children}</div>}
    </div>
  )
}
