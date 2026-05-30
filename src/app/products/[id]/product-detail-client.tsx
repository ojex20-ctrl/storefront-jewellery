"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Reveal } from "@podium/ui/motion"
import { Placeholder } from "@podium/ui/primitives"
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

type Props = { product: Product; related: Product[] }

export function ProductDetailClient({ product, related }: Props) {
  const params = useSearchParams()
  const add = useCartStore((s) => s.add)
  const customer = useAuthStore((s) => s.customer)
  const [metal, setMetal] = useState<Metal>(product.metals[0] ?? "Sterling")
  const [stone, setStone] = useState<Stone>(product.stones[0] ?? "None")
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null)
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [descOpen, setDescOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState(false)
  const initialMode: Mode =
    params.get("mode") === "rent" && product.rental.enabled ? "rent" : "buy"
  const [mode, setMode] = useState<Mode>(initialMode)
  const [rentalModalOpen, setRentalModalOpen] = useState(false)

  useEffect(() => {
    setMetal(product.metals[0] ?? "Sterling")
    setStone(product.stones[0] ?? "None")
    setSize(product.sizes[0] ?? null)
    setActiveImg(0)
    setQty(1)
    const wantsRent = params.get("mode") === "rent" && product.rental.enabled
    setMode(wantsRent ? "rent" : "buy")
    if (wantsRent) setRentalModalOpen(true)
  }, [product.id, product.metals, product.stones, product.sizes, product.rental.enabled, params])

  const onAdd = () => {
    if (mode === "rent") { setRentalModalOpen(true); return }
    if (product.sizes.length > 0 && !size) { toast.error("Choose a size"); return }
    for (let i = 0; i < qty; i++) {
      add(toCartLine(product, metal, stone, size))
    }
    toast.success(`${product.name} added to bag`)
  }

  const gallery = product.gallery.length > 0 ? product.gallery : [product.image]

  return (
    <div className="bg-white text-[#0A0A0A] min-h-screen">
      {/* Breadcrumbs */}
      <div className="px-6 py-4 md:px-12 border-b border-gray-100">
        <nav className="text-[12px] text-gray-500 space-x-2">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-black">{product.kind}</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      {/* Main product section */}
      <section className="flex flex-col md:flex-row px-6 md:px-12 py-8 gap-8 lg:gap-12 max-w-[1400px] mx-auto">
        {/* LEFT: Gallery */}
        <div className="flex gap-4 flex-1">
          {/* Thumbnail strip */}
          <div className="hidden md:flex flex-col gap-2 w-[70px] shrink-0">
            {gallery.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`aspect-square border-2 overflow-hidden transition-all ${
                  activeImg === i ? "border-black" : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Placeholder image={src} className="w-full h-full object-cover" alt={`Thumb ${i+1}`} />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1 aspect-[3/4] bg-gray-50 overflow-hidden relative">
            <Placeholder
              image={gallery[activeImg] ?? product.image}
              className="w-full h-full object-cover"
              alt={product.name}
            />
          </div>
        </div>

        {/* RIGHT: Product info */}
        <div className="md:w-[420px] lg:w-[480px] space-y-6">
          {/* Category tag */}
          <span className="text-[12px] text-accent font-medium">{product.kind}</span>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
            </div>
            <span className="text-[13px] text-gray-500">(36 Reviews)</span>
          </div>

          {/* Price + Quantity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">{priceFmt(product.price)}</span>
              {product.price < 100000 && (
                <span className="text-sm text-gray-400 line-through">{priceFmt(Math.round(product.price * 2.5))}</span>
              )}
            </div>
            <div className="flex items-center border border-gray-300 rounded">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-lg hover:bg-gray-100">−</button>
              <span className="px-3 py-2 text-sm font-medium min-w-[32px] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-lg hover:bg-gray-100">+</button>
            </div>
          </div>

          {/* Tax note */}
          <p className="text-[11px] text-gray-500">Tax included. Shipping calculated at checkout.</p>

          {/* Add to Cart */}
          <button
            onClick={onAdd}
            className="w-full bg-accent text-white py-4 rounded-full text-[14px] font-semibold tracking-wide hover:opacity-90 transition-opacity"
          >
            Add to Cart
          </button>

          {/* Offers */}
          <div className="border border-accent/30 rounded-lg p-4 space-y-2 bg-accent/5">
            <p className="text-[13px] flex items-center gap-2">
              <span className="text-accent">🎁</span> Mystery Jewellery Gift above ₹599
            </p>
            <p className="text-[13px] flex items-center gap-2">
              <span className="text-accent">🎁</span> Free Earring Organiser above ₹1999
            </p>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase">Easy Returns</p>
              <p className="text-[10px] text-gray-500">COD Available</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase">12L+ Customers</p>
              <p className="text-[10px] text-gray-500">4.8 Google Rating</p>
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase">Customer Support</p>
              <p className="text-[10px] text-gray-500">10:30am–5:30pm</p>
            </div>
          </div>

          {/* Metal selector */}
          {product.metals.length > 1 && (
            <div>
              <span className="text-[12px] font-medium text-gray-600 block mb-2">Material</span>
              <div className="flex flex-wrap gap-2">
                {product.metals.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetal(m)}
                    className={`border px-4 py-2 text-[12px] rounded transition-all ${
                      metal === m ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div>
              <span className="text-[12px] font-medium text-gray-600 block mb-2">Size</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`border w-10 h-10 flex items-center justify-center text-[12px] rounded transition-all ${
                      size === s ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Description */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setDescOpen(!descOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-[14px] font-medium hover:bg-gray-50"
            >
              Description
              <span className="text-gray-400">{descOpen ? "−" : "+"}</span>
            </button>
            {descOpen && (
              <div className="px-4 pb-4 text-[13px] text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                <p>{product.desc}</p>
                <p className="mt-3 text-[12px] text-gray-500">{METAL_NOTES[metal]}</p>
              </div>
            )}
          </div>

          {/* Collapsible FAQ */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setFaqOpen(!faqOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-[14px] font-medium hover:bg-gray-50"
            >
              Frequently Asked Questions
              <span className="text-gray-400">{faqOpen ? "−" : "+"}</span>
            </button>
            {faqOpen && (
              <div className="px-4 pb-4 text-[13px] text-gray-600 leading-relaxed border-t border-gray-100 pt-3 space-y-3">
                <div>
                  <p className="font-medium text-black">Is this anti-tarnish?</p>
                  <p>Yes, all SYRA pieces feature our proprietary anti-tarnish coating that lasts 2+ years.</p>
                </div>
                <div>
                  <p className="font-medium text-black">Is it waterproof?</p>
                  <p>Our jewellery is water-resistant. We recommend removing before swimming or showering.</p>
                </div>
                <div>
                  <p className="font-medium text-black">What is the return policy?</p>
                  <p>Easy 7-day returns. No questions asked.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 border-t border-gray-100">
        <h2 className="text-xl font-semibold text-center mb-10">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Priya S.", date: "05/2026", text: "Anti tarnish quality is amazing. Looks exactly like the picture!", rating: 5 },
            { name: "Ananya R.", date: "04/2026", text: "Quality is good with low rate. Very happy with my purchase.", rating: 5 },
            { name: "Meera K.", date: "03/2026", text: "Beautiful piece. Got so many compliments!", rating: 5 },
          ].map((review, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5 space-y-2">
              <div className="flex text-amber-400 text-sm">
                {"★".repeat(review.rating)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium">{review.name}</span>
                <span className="text-[11px] text-gray-400">{review.date}</span>
              </div>
              <p className="text-[13px] text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rental Modal */}
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
