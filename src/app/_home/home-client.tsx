"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Home as HomeIcon, PackageSearch, Ruler, Search } from "lucide-react"
import {
  Reveal,
  Marquee,
  Sparkles,
} from "@podium/ui/motion"
import { Eyebrow, Placeholder, Button } from "@podium/ui/primitives"
import { TrustStrip } from "@podium/ui/chrome"
import { priceFmt } from "@podium/ui/lib"
import { useBrand } from "@/providers/brand-provider"

import type { Product } from "@/lib/products"
import { ProductCard } from "@/components/product/product-card"

export function HomeClient({ products }: { products: Product[] }) {
  const brand = useBrand()
  const featured = products.slice(0, 8)
  const [currentHero, setCurrentHero] = useState(0)
  
  // ─── COLLECTION MASK CAROUSEL LOGIC ───
  const [carouselIndex, setCarouselIndex] = useState(0)
  const collectionTouchStart = useRef<number | null>(null)

  const baseCategories = [
    { name: "Bracelets", key: "Bracelet", img: products.find(p => p.kind === "Bracelet")?.image },
    { name: "Pendant", key: "Necklace", img: products.find(p => p.kind === "Necklace")?.image },
    { name: "Earrings", key: "Earrings", img: products.find(p => p.kind === "Earrings")?.image },
    { name: "Rings", key: "Ring", img: products.find(p => p.kind === "Ring")?.image },
  ]
  const extendedCategories = [...baseCategories, ...baseCategories, ...baseCategories]

  const windows = [
    "rounded-tl-[5rem] rounded-tr-2xl rounded-b-2xl",
    "rounded-2xl",
    "rounded-2xl",
    "rounded-tr-[5rem] rounded-tl-2xl rounded-b-2xl"
  ]

  const handleNext = () => setCarouselIndex(p => Math.min(p + 1, extendedCategories.length - windows.length))
  const handlePrev = () => setCarouselIndex(p => Math.max(p - 1, 0))
  const handleMobileCollectionNext = () => setCarouselIndex(p => (p + 1) % baseCategories.length)
  const handleMobileCollectionPrev = () => setCarouselIndex(p => (p - 1 + baseCategories.length) % baseCategories.length)

  const heroSlides = [
    {
      image: "/hero/syra_hero_1.png",
      title: "Anti-Tarnish",
      subtitle: "Elegance",
      description: "Jewellery that lasts a lifetime. Crafted with precision.",
      href: "/collection",
    },
    {
      image: "/hero/syra_hero_2.png",
      title: "Timeless",
      subtitle: "Collection",
      description: "Curated pieces for the modern individual.",
      href: "/collection",
    },
    {
      image: "/hero/syra_hero_3.png",
      title: "Crafted",
      subtitle: "Brilliance",
      description: "Rose gold, platinum, and beyond.",
      href: "/collection",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % baseCategories.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [baseCategories.length])

  return (
    <div className="bg-bg text-ink">
      {/* ─── HERO CAROUSEL ─────────────────────────────────────────────── */}
      <section className="relative w-full h-[100svh] max-h-[900px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroSlides[currentHero]?.image}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/[0.35]" />
            </div>
            <div className="relative z-10 flex h-full flex-col items-center justify-end pb-[15%] px-6">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center"
              >
                {/* Frost background behind text */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-10 py-8 md:px-16 md:py-12">
                  <motion.p
                    initial={{ opacity: 0, letterSpacing: "0.5em" }}
                    animate={{ opacity: 1, letterSpacing: "0.3em" }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70"
                  >
                    SYRA
                  </motion.p>
                  <h1 className="font-display text-5xl sm:text-7xl md:text-[90px] leading-[0.9] tracking-tight text-white mb-2">
                    {heroSlides[currentHero]?.title}
                  </h1>
                  <h2 className="font-display text-4xl sm:text-5xl md:text-[70px] italic leading-[0.9] tracking-tight text-[#C2B9A7] mb-5">
                    {heroSlides[currentHero]?.subtitle}
                  </h2>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/60 max-w-md mx-auto mb-8">
                    {heroSlides[currentHero]?.description}
                  </p>
                  <Link href={heroSlides[currentHero]?.href ?? "/collection"}>
                    <button className="border border-white/40 px-10 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-black">
                      Shop Now
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left Category Sidebar */}
        <div className="absolute left-0 top-0 bottom-0 z-30 w-[80px] md:w-[120px] bg-black/40 backdrop-blur-md hidden md:flex flex-col items-center justify-center py-8 gap-5 overflow-y-auto">
          {[
            { title: "Best Sellers", href: "/collection", img: products.find(p => p.kind === "Bracelet")?.image },
            { title: "Earrings", href: "/collection?kind=Earrings", img: products.find(p => p.kind === "Earrings")?.image },
            { title: "Necklace", href: "/collection?kind=Necklace", img: products.find(p => p.kind === "Necklace")?.image },
            { title: "Bracelets", href: "/collection?kind=Bracelet", img: products.find(p => p.kind === "Bracelet")?.image },
            { title: "Rings", href: "/collection?kind=Ring", img: products.find(p => p.kind === "Ring")?.image },
            { title: "Pendants", href: "/collection?kind=Necklace", img: products.find(p => p.kind === "Necklace")?.image },
          ].map((cat, i) => (
            <Link href={cat.href} key={i} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/30 p-[2px] group-hover:border-white transition-colors">
                <div className="w-full h-full rounded-full overflow-hidden bg-white/10">
                  <Placeholder
                    image={cat.img ?? "/placeholder.png"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={cat.title}
                  />
                </div>
              </div>
              <span className="text-white text-[8px] md:text-[9px] font-medium tracking-wide text-center leading-tight">
                {cat.title}
              </span>
            </Link>
          ))}
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentHero(i)}
              className={`h-[2px] transition-all duration-500 ${
                currentHero === i ? "w-12 bg-white" : "w-6 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block">
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/30 [writing-mode:vertical-rl] rotate-180">
            Anti-Tarnish Jewellery
          </p>
        </div>
      </section>

      {/* ─── ANTI-TARNISH MARQUEE ─────────────────────────────────────── */}
      <section className="border-y border-line py-5 bg-bg">
        <Marquee
          items={[
            "Anti-Tarnish Technology",
            "Lifetime Warranty",
            "Ethically Sourced",
            `Free Shipping Over ${priceFmt(brand.free_shipping_threshold)}`,
            "SYRA — Timeless Elegance",
          ]}
          speed={35}
          separator="◆"
          className="font-mono text-[14px] uppercase tracking-[0.2em] text-muted"
        />
      </section>

      <QuickActionsSection freeShippingThreshold={brand.free_shipping_threshold} />

      {/* ─── SHOP YOUR VIBE ─────────────────────────────────────────── */}
      <section className="px-6 py-20 md:px-12 bg-bg">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-10">Shop Your Vibe</h2>
          <div className="shop-vibe-scroller flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {[
              { title: "Boss Babe Basic", sub: "Minimal. Mindful. Made To Impress.", color: "from-[#D4C9B5] to-[#E8DFD0]", img: "/jewellery/gen-gold-bracelet.png", href: "/collection?vibe=minimal" },
              { title: "Glam Girl Hours", sub: "Shines Loud, Glow Louder.", color: "from-[#F5C6D0] to-[#FDDDE6]", img: "/jewellery/gen-crystal-earrings.png", href: "/collection?vibe=glam" },
              { title: "Everyday Slay", sub: "Effortless Sparkle For Your Daily Story.", color: "from-[#F5F0E0] to-[#FFF8E8]", img: "/jewellery/gen-gold-necklace.png", href: "/collection?vibe=everyday" },
              { title: "Main Character Campus", sub: "Stand out on campus.", color: "from-[#B8D4C8] to-[#D0E8DC]", img: "/jewellery/gen-pink-heart-ring.png", href: "/collection?vibe=campus" },
              { title: "Bold Babe Edit", sub: "Unapologetic. Unfiltered. You.", color: "from-[#1A1A1A] to-[#0A0A0A]", img: "/jewellery/gen-ruby-earrings.png", href: "/collection?vibe=bold" },
            ].map((vibe, i) => (
              <Link
                key={i}
                href={vibe.href}
                className="shop-vibe-card group min-w-[200px] md:min-w-[240px] flex-shrink-0"
              >
                <div className={`relative h-[320px] md:h-[380px] rounded-2xl overflow-hidden bg-gradient-to-b ${vibe.color} border border-white/10 flex flex-col justify-end transition-transform duration-300 group-hover:scale-[1.02]`}>
                  {/* Product image */}
                  <div className="absolute inset-0 flex items-center justify-center p-6 pt-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vibe.img}
                      alt={vibe.title}
                      className="w-[70%] h-[60%] object-contain opacity-90 group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                    />
                  </div>
                  {/* Text overlay at bottom */}
                  <div className={`relative z-10 m-4 rounded bg-bg/85 p-4 text-ink shadow-sm backdrop-blur-sm`}>
                    <h3 className="font-display text-xl md:text-2xl leading-tight mb-1">
                      {vibe.title}
                    </h3>
                    <p className="font-mono text-[9px] tracking-wide text-muted">
                      {vibe.sub}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEW IN PRODUCTS ─────────────────────────────────────────── */}
      <section className="px-6 py-20 md:px-12 bg-bg">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="font-display text-3xl md:text-4xl text-ink mb-10">New In</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Link href="/collection">
              <button className="border border-line px-10 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink hover:bg-accent hover:text-bg hover:border-accent transition-all">
                View All
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── COLLECTION CAROUSEL (Curved Edges) ─────────────────────── */}
      <section className="px-6 py-24 md:px-12 bg-bg">
        <div className="flex items-center gap-6 mb-16 max-w-[1400px] mx-auto w-full">
           <h2 className="font-display text-4xl md:text-5xl text-ink">Collection</h2>
           <div className="flex-1 h-[1px] bg-line relative flex items-center justify-between">
              <svg className="absolute left-0 -translate-x-1/2 text-accent w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
              <svg className="absolute left-1/2 -translate-x-1/2 text-accent w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
              <svg className="absolute right-0 translate-x-1/2 text-accent w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
           </div>
        </div>
        
        <div
          className="collection-mobile-slider overflow-x-auto no-scrollbar pb-12 pt-4 w-full"
          onTouchStart={(e) => { collectionTouchStart.current = e.touches[0]?.clientX ?? null }}
          onTouchEnd={(e) => {
            if (collectionTouchStart.current === null) return
            const delta = (e.changedTouches[0]?.clientX ?? collectionTouchStart.current) - collectionTouchStart.current
            if (Math.abs(delta) > 36) {
              if (delta < 0) handleMobileCollectionNext()
              else handleMobileCollectionPrev()
            }
            collectionTouchStart.current = null
          }}
        >
           <div className="collection-mobile-track flex gap-6 w-max mx-auto [--card-w:280px] md:[--card-w:340px] [--gap:24px]">
             {windows.map((shape, i) => (
                <div key={i} className={`collection-window w-[var(--card-w)] h-[420px] shrink-0 overflow-hidden relative ${shape} bg-bg shadow-lg border border-line pointer-events-none`}>
                   <div 
                      className="absolute top-0 flex gap-[var(--gap)] transition-transform duration-700 ease-out pointer-events-auto"
                      style={{
                         transform: `translateX(calc((var(--card-w) + var(--gap)) * -${i + carouselIndex}))`
                      }}
                   >
                      {extendedCategories.map((cat, j) => (
                         <Link 
                           href={`/collection?category=${cat.key}`} 
                           key={j} 
                           className="w-[var(--card-w)] h-[420px] shrink-0 flex flex-col group cursor-pointer bg-bg-2"
                         >
                            <div className="flex-1 relative overflow-hidden bg-bg-2">
                              <Placeholder 
                                image={cat.img ?? "/placeholder.png"} 
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                alt={cat.name}
                              />
                            </div>
                            <div className="bg-bg-2 text-ink p-6 flex justify-between items-center shrink-0 border-t border-line">
                               <span className="font-display text-2xl tracking-wide">{cat.name}</span>
                               <div className="w-8 h-8 rounded-full bg-accent text-bg flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
                                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1V13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                 </svg>
                               </div>
                            </div>
                         </Link>
                      ))}
                   </div>
                </div>
             ))}
           </div>
        </div>

        {/* Carousel Controls */}
        <div className="flex justify-center items-center gap-6 mt-8 max-w-[1400px] mx-auto">
          <div className="h-[2px] w-64 bg-line relative overflow-hidden rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: '33.33%', left: `${(carouselIndex / (extendedCategories.length - windows.length)) * 66.66}%` }}
            ></div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink hover:bg-accent hover:text-bg hover:border-accent transition-colors shrink-0 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink disabled:hover:border-line"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={handleNext}
              disabled={carouselIndex >= extendedCategories.length - windows.length}
              className="w-8 h-8 rounded-full border border-accent bg-accent text-bg flex items-center justify-center hover:bg-opacity-80 transition-colors shrink-0 disabled:opacity-30 disabled:hover:bg-accent disabled:hover:text-bg"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ─── ROTATING PRICE RANGE SECTIONS ────────────────────────────── */}
      <PriceRangeCarousel products={products} />

      {/* ─── EDITORIAL STORY ─────────────────────────────────────────── */}
      <section className="grid md:grid-cols-2">
        <div className="aspect-square md:aspect-auto overflow-hidden">
          <Placeholder 
            image={products[1]?.image} 
            className="h-full w-full object-cover" 
            alt="Editorial Story"
          />
        </div>
        <div className="flex flex-col justify-center bg-paper p-8 text-ink md:p-20">
          <Reveal>
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Philosophy</p>
            <h2 className="mb-8 font-display text-4xl leading-[1.1] tracking-tight text-ink md:text-5xl">
              Quiet luxury,<br />understated confidence.
            </h2>
            <p className="mb-10 max-w-md text-base leading-relaxed text-muted">
              At SYRA, we create jewellery that doesn&apos;t shout. Using advanced anti-tarnish technology, our pieces are designed for the modern individual who values durability as much as aesthetic.
            </p>
            <Link href="/about">
              <button className="border border-line px-10 py-3 font-mono text-[10px] uppercase tracking-widest text-ink transition-all hover:border-accent hover:bg-accent hover:text-bg">
                Our Story
              </button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ─── INTERACTIVE 3D SCATTER SECTION ──────────────────────────── */}
      <ScatterSection products={products} />
    </div>
  )
}

function QuickActionsSection({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const actions = [
    { href: "/collection", label: "Shop all", detail: `Free shipping over ${priceFmt(freeShippingThreshold)}`, icon: HomeIcon },
    { href: "/search", label: "Search styles", detail: "Rings, pearls, stone colors, and edits", icon: Search },
    { href: "/order-track", label: "Track order", detail: "Status, totals, and shipment links", icon: PackageSearch },
    { href: "/size-guide", label: "Size guide", detail: "Ring and jewellery fit before checkout", icon: Ruler },
  ]

  return (
    <section className="border-b border-line bg-bg px-6 py-12 md:px-12">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/80">Start here</p>
            <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">Everything one tap away</h2>
          </div>
          <Link href="/order-track" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-accent hover:underline">
            Track an order
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href} className="group border border-line bg-paper p-5 transition-colors hover:border-accent">
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center border border-line text-accent group-hover:border-accent">
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-2xl leading-tight text-ink">{action.label}</h3>
                <p className="mt-2 min-h-10 text-sm leading-5 text-muted">{action.detail}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function PriceRangeCarousel({ products }: { products: Product[] }) {
  const [activeTier, setActiveTier] = useState(0)
  const [progress, setProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Real products bucketed by price (paise). Empty tiers are dropped so we never
  // show fabricated items — everything here is a live product that links to its PDP.
  const tierDefs = [
    { heading: ["Gifts Under", "₹499"], viewAllHref: "/collection?price_max=499", min: 0, max: 49900 },
    { heading: ["Under", "₹899"], viewAllHref: "/collection?price_max=899", min: 49900, max: 89900 },
    { heading: ["Premium", "₹1,000+"], viewAllHref: "/collection?price_min=1000", min: 100000, max: Infinity },
  ]
  let tiers = tierDefs
    .map((t) => ({ ...t, items: products.filter((p) => p.price >= t.min && p.price < t.max).slice(0, 8) }))
    .filter((t) => t.items.length > 0)
  if (tiers.length === 0 && products.length > 0) {
    tiers = [{ heading: ["Shop the", "collection"], viewAllHref: "/collection", min: 0, max: Infinity, items: products.slice(0, 8) }]
  }

  useEffect(() => {
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + (100 / 50)
      })
    }, 100)
    const cycleTimer = setTimeout(() => {
      setActiveTier(prev => (prev + 1) % tiers.length)
    }, 5000)
    return () => {
      clearInterval(progressInterval)
      clearTimeout(cycleTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTier])

  if (tiers.length === 0) return null
  const tier = tiers[Math.min(activeTier, tiers.length - 1)]!

  return (
    <section className="px-6 py-16 md:px-12 bg-bg-2 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="flex items-center gap-6 mb-12 max-w-[1400px] mx-auto w-full">
            <h2 className="font-display text-4xl md:text-5xl text-ink leading-[1.1] whitespace-nowrap">
              {tier.heading[0]}<br />{tier.heading[1]}
            </h2>
            <div className="flex-1 flex items-center relative pl-8">
              <svg className="absolute left-0 -translate-x-1/2 text-accent w-8 h-8 z-10 bg-bg-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
              </svg>
              <div className="h-[1px] w-full bg-line" />
              <Link href={tier.viewAllHref}>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-bg-2 px-6 py-2 border border-line rounded-[50px] text-xs text-ink hover:bg-accent hover:text-bg transition-colors whitespace-nowrap">
                  View all
                </button>
              </Link>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory max-w-[1400px] mx-auto scroll-smooth">
            {tier.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] snap-start flex flex-col gap-4 shrink-0"
              >
                <Link href={`/products/${item.id}`} className="relative block aspect-square rounded-xl overflow-hidden bg-bg">
                  <Placeholder image={item.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  {item.tag ? (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-bg/90 text-[10px] font-bold px-2 py-1 rounded-[4px] text-ink">{item.tag}</span>
                    </div>
                  ) : null}
                </Link>
                <div className="flex flex-col gap-1 px-1">
                  <Link href={`/products/${item.id}`} className="text-sm text-ink/80 leading-tight line-clamp-2 h-10 hover:text-accent">{item.name}</Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-base text-ink">{priceFmt(item.price)}</span>
                  </div>
                </div>
                <Link href={`/products/${item.id}`} className="w-full bg-accent text-bg py-3 rounded-md text-xs font-bold tracking-wider text-center hover:bg-opacity-80 transition-colors mt-auto">
                  SHOP NOW
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center items-center gap-6 mt-8 max-w-[1400px] mx-auto">
        <div className="h-[2px] w-64 bg-line relative overflow-hidden rounded-full">
          <motion.div className="absolute top-0 left-0 h-full bg-accent rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
        </div>
        <div className="flex gap-3">
          {tiers.map((_, i) => (
            <button key={i} onClick={() => setActiveTier(i)} className={`transition-all duration-500 rounded-full ${activeTier === i ? "w-8 h-2 bg-accent" : "w-2 h-2 bg-muted/40 hover:bg-muted"}`} />
          ))}
        </div>
      </div>
    </section>
  )
}


type JewelPiece = { src: string; label: string; w: number; x: number; y: number; sx: number; sy: number; spin: number }
function ScatterSection({ products: _products }: { products: Product[] }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [cursorPx, setCursorPx] = useState({ x: -9999, y: -9999 })
  const [scatterMode, setScatterMode] = useState<"gather" | "spread">("gather")
  const [focused, setFocused] = useState<JewelPiece | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setScatterMode((mode) => (mode === "gather" ? "spread" : "gather"))
    }, 6200)
    return () => clearInterval(timer)
  }, [])

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    setCursorPx({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const jewelleryPieces: JewelPiece[] = [
    { src: "/jewellery/gen-diamond-ring.png", label: "Diamond Ring", w: 118, x: 42, y: 38, sx: 14, sy: 24, spin: -18 },
    { src: "/jewellery/gen-pink-heart-ring.png", label: "Pink Heart", w: 102, x: 55, y: 45, sx: 30, sy: 70, spin: 14 },
    { src: "/jewellery/gen-sapphire-ring.png", label: "Sapphire Ring", w: 98, x: 38, y: 52, sx: 80, sy: 22, spin: 22 },
    { src: "/jewellery/gen-crystal-earrings.png", label: "Crystal Drops", w: 112, x: 48, y: 28, sx: 88, sy: 68, spin: -28 },
    { src: "/jewellery/gen-ruby-earrings.png", label: "Ruby Drops", w: 106, x: 35, y: 42, sx: 12, sy: 76, spin: 32 },
    { src: "/jewellery/gen-gold-bracelet.png", label: "Gold Chain", w: 132, x: 45, y: 55, sx: 48, sy: 15, spin: -8 },
    { src: "/jewellery/gen-gold-necklace.png", label: "Gold Pendant", w: 120, x: 52, y: 32, sx: 66, sy: 84, spin: 12 },
    { src: "/jewellery/citrine-pendant.png", label: "Citrine Pendant", w: 104, x: 58, y: 58, sx: 7, sy: 48, spin: -14 },
    { src: "/jewellery/gen-gold-bar.png", label: "Gold Ingot", w: 96, x: 50, y: 48, sx: 91, sy: 43, spin: 18 },
  ]

  type Gem = { glow: string; sz: number; x: number; y: number; sx: number; sy: number; label: string }
  const mkGem = (label: string, glow: string, sz: number, x: number, y: number, sx: number, sy: number): Gem => ({ label, glow, sz, x, y, sx, sy })
  const gemstones: Gem[] = [
    mkGem("Diamond", "rgba(215,232,255,0.58)", 72, 46, 40, 20, 35),
    mkGem("Ruby", "rgba(220,20,60,0.55)", 64, 48, 35, 36, 22),
    mkGem("Sapphire", "rgba(45,88,220,0.55)", 66, 40, 36, 60, 28),
    mkGem("Emerald", "rgba(42,190,105,0.52)", 60, 53, 36, 76, 54),
    mkGem("Pink Diamond", "rgba(255,120,180,0.54)", 62, 50, 38, 28, 58),
    mkGem("Diamond", "rgba(215,232,255,0.48)", 42, 32, 38, 9, 18),
    mkGem("Ruby", "rgba(220,20,60,0.46)", 38, 63, 35, 93, 18),
    mkGem("Sapphire", "rgba(45,88,220,0.46)", 36, 60, 62, 84, 83),
    mkGem("Emerald", "rgba(42,190,105,0.46)", 34, 36, 35, 16, 88),
    mkGem("Pink Diamond", "rgba(255,120,180,0.46)", 36, 58, 60, 52, 92),
    mkGem("Diamond", "rgba(215,232,255,0.42)", 28, 30, 50, 42, 9),
    mkGem("Ruby", "rgba(220,20,60,0.42)", 30, 54, 42, 70, 13),
    mkGem("Sapphire", "rgba(45,88,220,0.42)", 32, 35, 52, 96, 72),
    mkGem("Emerald", "rgba(42,190,105,0.42)", 30, 64, 45, 5, 65),
    mkGem("Pink Diamond", "rgba(255,120,180,0.42)", 30, 42, 50, 63, 72),
  ]

  const isSpread = scatterMode === "spread" || Boolean(focused)
  const REPULSE_R = 150

  const focusPiece = (piece: JewelPiece) => {
    setFocused(piece)
    setScatterMode("spread")
  }

  useEffect(() => {
    if (!focused) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocused(null)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [focused])

  const handleStageTap = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest("[data-jewel-control='true']")) return

    const rect = stageRef.current.getBoundingClientRect()
    const tapX = event.clientX - rect.left
    const tapY = event.clientY - rect.top
    const nearest = jewelleryPieces.reduce<{ piece: JewelPiece; dist: number } | null>((best, piece) => {
      const px = ((isSpread ? piece.sx : piece.x) / 100) * rect.width
      const py = ((isSpread ? piece.sy : piece.y) / 100) * rect.height
      const dist = Math.hypot(px - tapX, py - tapY)
      if (!best || dist < best.dist) return { piece, dist }
      return best
    }, null)

    if (nearest && nearest.dist <= 180) focusPiece(nearest.piece)
  }

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setCursorPx({ x: -9999, y: -9999 })}
      className="relative flex min-h-[820px] w-full flex-col items-center justify-center overflow-hidden border-y border-line bg-bg px-4 py-20 text-ink md:min-h-[920px] md:px-10 md:py-24 md:cursor-none"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_48%_at_50%_42%,rgba(194,185,167,0.14),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10"
        animate={{ rotate: 360, scale: isSpread ? 1.1 : 0.82, opacity: isSpread ? 0.75 : 0.35 }}
        transition={{ rotate: { repeat: Infinity, duration: 36, ease: "linear" }, scale: { duration: 1.2 }, opacity: { duration: 1.2 } }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10"
        animate={{ rotate: -360, scale: isSpread ? 1.35 : 0.7, opacity: isSpread ? 0.5 : 0.2 }}
        transition={{ rotate: { repeat: Infinity, duration: 28, ease: "linear" }, scale: { duration: 1.2 }, opacity: { duration: 1.2 } }}
      />

      <div className="relative z-30 mb-6 max-w-4xl text-center">
        <span className="mb-3 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent/70">Interactive Experience</span>
        <h2 className="font-display text-5xl leading-none tracking-tight text-ink md:text-8xl">
          Dynamic <em className="text-accent">Brilliance</em>
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-mono text-[10px] uppercase tracking-widest text-muted">
          {isSpread ? "Jewels in motion across the canvas" : "Move your cursor to push the jewels"}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setScatterMode((mode) => (mode === "gather" ? "spread" : "gather"))}
            className="border border-line bg-paper/80 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted backdrop-blur transition-colors hover:border-accent hover:text-accent"
          >
            {scatterMode === "gather" ? "Scatter" : "Gather"}
          </button>
          <Link href="/collection" className="border border-accent bg-accent px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-bg transition-opacity hover:opacity-85">
            Explore
          </Link>
        </div>
      </div>

      <div ref={stageRef} onClick={handleStageTap} className="relative z-10 h-[510px] w-full max-w-[1250px] touch-pan-y md:h-[610px]">
        {gemstones.map((gem, i) => (
          <RepulsionItem
            key={`g-${i}`}
            restX={isSpread ? gem.sx : gem.x}
            restY={isSpread ? gem.sy : gem.y}
            cursorPx={cursorPx}
            stageRef={stageRef}
            repulseRadius={REPULSE_R * 0.82}
            mass={0.45 + gem.sz / 180}
            idx={i}
            spread={isSpread}
            hitSize={gem.sz * 1.35}
          >
            <DiamondCut size={gem.sz} glow={gem.glow} variant={gem.label} />
          </RepulsionItem>
        ))}
        {jewelleryPieces.map((piece, i) => (
          <RepulsionItem
            key={`j-${i}`}
            restX={isSpread ? piece.sx : piece.x}
            restY={isSpread ? piece.sy : piece.y}
            cursorPx={cursorPx}
            stageRef={stageRef}
            repulseRadius={REPULSE_R}
            mass={0.9 + piece.w / 280}
            idx={i + 200}
            spread={isSpread}
            active={focused?.label === piece.label}
            onSelect={() => focusPiece(piece)}
            hitSize={piece.w + 54}
            ariaLabel={`Preview ${piece.label}`}
          >
            <div className="relative drop-shadow-[0_16px_35px_rgba(0,0,0,0.45)]" style={{ width: piece.w, height: piece.w }}>
              <div className="pointer-events-none absolute inset-[-18%] rounded-full bg-accent/10 blur-2xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={piece.src}
                alt={piece.label}
                className="pointer-events-none relative h-full w-full select-none object-contain transition-transform duration-500 hover:scale-110"
                style={{ filter: "contrast(1.08) saturate(1.18)" }}
                draggable={false}
              />
            </div>
          </RepulsionItem>
        ))}

        {cursorPx.x > 0 && (
          <motion.div
            className="pointer-events-none absolute z-50 hidden h-12 w-12 items-center justify-center rounded-full border border-accent/25 bg-bg/20 backdrop-blur-sm md:flex"
            animate={{ x: cursorPx.x - 24, y: cursorPx.y - 24, scale: isSpread ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
          >
            <div className="h-2 w-2 rounded-full bg-accent/70" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            role="presentation"
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFocused(null)}
          >
            <motion.div
              className="relative grid w-full max-w-[760px] grid-cols-1 overflow-hidden border border-accent/25 bg-paper text-left shadow-[0_40px_140px_rgba(0,0,0,0.65)] md:grid-cols-[1.1fr_0.9fr]"
              initial={{ y: 40, scale: 0.88, rotate: -4 }}
              animate={{ y: 0, scale: 1, rotate: 0 }}
              exit={{ y: 28, scale: 0.9, rotate: 3 }}
              transition={{ type: "spring", stiffness: 110, damping: 17 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-bg-2 p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(194,185,167,0.2),transparent_62%)]" />
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 2.5, 0] }}
                  transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-[-20%] rounded-full bg-accent/15 blur-3xl" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={focused.src} alt="" className="relative max-h-[320px] w-full object-contain drop-shadow-[0_22px_45px_rgba(0,0,0,0.55)]" />
                </motion.div>
              </div>
              <div className="flex flex-col justify-center p-7 md:p-9">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">SYRA Motion Study</p>
                <h3 className="mt-4 font-display text-4xl leading-none text-ink md:text-5xl">{focused.label}</h3>
                <p className="mt-5 text-sm leading-6 text-muted">
                  A closer look at the anti-tarnish shine, with the collection spreading around it like a jewellery tray in motion.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/collection" className="bg-accent px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-bg transition-opacity hover:opacity-85">
                    Shop pieces
                  </Link>
                  <button type="button" onClick={() => setFocused(null)} className="border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function DiamondCut({ size, glow, variant }: { size: number; glow: string; variant: string }) {
  // Color palettes for each gem type
  const colors: Record<string, { crown: string; table: string; pavilion: string; girdle: string; highlight: string }> = {
    Diamond: { crown: "#e8f4ff", table: "#ffffff", pavilion: "#a8c8e8", girdle: "#c8ddf0", highlight: "#ffffff" },
    Ruby: { crown: "#ff4444", table: "#ff6666", pavilion: "#8b0000", girdle: "#cc2222", highlight: "#ffaaaa" },
    Sapphire: { crown: "#4466cc", table: "#6688ee", pavilion: "#112266", girdle: "#3355aa", highlight: "#aabbff" },
    Emerald: { crown: "#22aa55", table: "#44cc77", pavilion: "#0d5528", girdle: "#1a8844", highlight: "#88eebb" },
    "Pink Diamond": { crown: "#ff88bb", table: "#ffaacc", pavilion: "#993366", girdle: "#cc5588", highlight: "#ffdde8" },
  }
  const c = colors[variant] ?? colors.Diamond!

  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      style={{ filter: `drop-shadow(0 0 ${size * 0.4}px ${glow}) drop-shadow(0 0 ${size * 0.2}px ${glow})` }}
    >
      {/* Crown facets (top) */}
      <polygon points="50,0 30,15 50,25 70,15" fill={c.highlight} opacity="0.9" />
      <polygon points="50,0 70,15 85,20 65,5" fill={c.crown} opacity="0.8" />
      <polygon points="50,0 30,15 15,20 35,5" fill={c.crown} opacity="0.7" />
      
      {/* Star facets */}
      <polygon points="30,15 15,20 20,35 50,25" fill={c.table} opacity="0.85" />
      <polygon points="70,15 85,20 80,35 50,25" fill={c.crown} opacity="0.75" />
      
      {/* Table (top flat face) */}
      <polygon points="50,25 20,35 35,40 50,38 65,40 80,35" fill={c.table} opacity="0.95" />
      
      {/* Girdle (middle band) */}
      <polygon points="15,20 5,45 20,35" fill={c.girdle} opacity="0.6" />
      <polygon points="85,20 95,45 80,35" fill={c.girdle} opacity="0.5" />
      <polygon points="20,35 5,45 15,50 35,40" fill={c.girdle} opacity="0.65" />
      <polygon points="80,35 95,45 85,50 65,40" fill={c.girdle} opacity="0.55" />
      
      {/* Pavilion facets (bottom - the V shape) */}
      <polygon points="35,40 15,50 50,120" fill={c.pavilion} opacity="0.7" />
      <polygon points="65,40 85,50 50,120" fill={c.pavilion} opacity="0.6" />
      <polygon points="35,40 50,38 50,120" fill={c.pavilion} opacity="0.8" />
      <polygon points="65,40 50,38 50,120" fill={c.pavilion} opacity="0.5" />
      
      {/* Lower pavilion facets */}
      <polygon points="15,50 5,45 50,120" fill={c.pavilion} opacity="0.4" />
      <polygon points="85,50 95,45 50,120" fill={c.pavilion} opacity="0.35" />
      
      {/* Highlight reflections */}
      <polygon points="50,25 45,30 50,35 55,30" fill={c.highlight} opacity="0.6" />
      <polygon points="30,18 35,22 32,25" fill={c.highlight} opacity="0.4" />
    </svg>
  )
}

function RepulsionItem({
  restX, restY, cursorPx, stageRef, repulseRadius, mass, idx, spread, active = false, onSelect, hitSize = 1, ariaLabel, children,
}: {
  restX: number
  restY: number
  cursorPx: { x: number; y: number }
  stageRef: React.RefObject<HTMLDivElement | null>
  repulseRadius: number
  mass: number
  idx: number
  spread: boolean
  active?: boolean
  onSelect?: () => void
  hitSize?: number
  ariaLabel?: string
  children: React.ReactNode
}) {
  const rect = stageRef.current?.getBoundingClientRect()
  const cw = rect?.width ?? 1200
  const ch = rect?.height ?? 600
  const rx = (restX / 100) * cw
  const ry = (restY / 100) * ch

  const effectiveRadius = repulseRadius * (spread ? 1.18 : 1.5)
  const dx = rx - cursorPx.x
  const dy = ry - cursorPx.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  let offsetX = 0
  let offsetY = 0
  let rotateZ = spread ? ((idx % 9) - 4) * 2.2 : 0

  if (dist < effectiveRadius && dist > 0) {
    const ratio = (effectiveRadius - dist) / effectiveRadius
    const force = ratio * ratio * (spread ? 280 : 440) / mass
    offsetX = (dx / dist) * force
    offsetY = (dy / dist) * force
    rotateZ += (dx / dist) * force * 0.22
  }

  const selectable = Boolean(onSelect)

  return (
    <motion.div
      role={selectable ? "button" : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-label={selectable ? ariaLabel : undefined}
      data-jewel-control={selectable ? "true" : undefined}
      className={`absolute flex items-center justify-center ${
        selectable
          ? "pointer-events-auto cursor-pointer touch-manipulation select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          : "pointer-events-none"
      }`}
      style={{
        left: `calc(${restX}% - ${hitSize / 2}px)`,
        top: `calc(${restY}% - ${hitSize / 2}px)`,
        width: hitSize,
        height: hitSize,
        zIndex: active ? 34 : dist < repulseRadius ? 24 : selectable ? 16 : 12,
      }}
      animate={{
        x: offsetX,
        y: offsetY,
        rotate: rotateZ,
        scale: active ? 1.22 : dist < repulseRadius && dist > 0 ? 1.06 + 0.12 * ((repulseRadius - dist) / repulseRadius) : spread ? 1.03 : 1,
      }}
      whileTap={selectable ? { scale: active ? 1.12 : 0.96 } : undefined}
      transition={{ type: "spring", damping: 34, stiffness: 64, mass: mass * 0.58 }}
      onClick={(event) => {
        if (!onSelect) return
        event.stopPropagation()
        onSelect()
      }}
      onKeyDown={(event) => {
        if (!onSelect) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <motion.div
        className="flex h-full w-full items-center justify-center"
        animate={{
          y: [0, -5 - (idx % 4) * 1.6, 0],
          rotate: [0, (idx % 2 === 0 ? 1.8 : -1.8), 0],
        }}
        transition={{ repeat: Infinity, duration: 4.2 + (idx % 4), ease: "easeInOut", delay: (idx % 10) * 0.18 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
