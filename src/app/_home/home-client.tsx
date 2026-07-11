"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
            "Free Shipping Over ₹999",
            "SYRA — Timeless Elegance",
          ]}
          speed={35}
          separator="◆"
          className="font-mono text-[14px] uppercase tracking-[0.2em] text-muted"
        />
      </section>

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
                  <div className={`relative z-10 p-5 ${i === 4 ? 'text-white' : 'text-[#0A0A0A]'}`}>
                    <h3 className="font-display text-xl md:text-2xl leading-tight mb-1">
                      {vibe.title}
                    </h3>
                    <p className={`text-[9px] font-mono tracking-wide ${i === 4 ? 'text-white/60' : 'text-[#0A0A0A]/60'}`}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
           <div className="flex-1 h-[1px] bg-white/20 relative flex items-center justify-between">
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
                <div key={i} className={`collection-window w-[var(--card-w)] h-[420px] shrink-0 overflow-hidden relative ${shape} bg-bg shadow-lg border border-white/10 pointer-events-none`}>
                   <div 
                      className="absolute top-0 flex gap-[var(--gap)] transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-auto"
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
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" 
                                alt={cat.name}
                              />
                            </div>
                            <div className="bg-bg-2 text-ink p-6 flex justify-between items-center shrink-0 border-t border-white/5">
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
          <div className="h-[2px] w-64 bg-white/20 relative overflow-hidden rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: '33.33%', left: `${(carouselIndex / (extendedCategories.length - windows.length)) * 66.66}%` }}
            ></div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-ink hover:bg-accent hover:text-bg hover:border-accent transition-colors shrink-0 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink disabled:hover:border-white/30"
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
        <div className="flex flex-col justify-center p-12 md:p-20 bg-[#F5F3EE]">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#8A8070] mb-6">Philosophy</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.1] text-[#0A0A0A] mb-8">
              Quiet luxury,<br />understated confidence.
            </h2>
            <p className="text-[#0A0A0A]/70 text-base leading-relaxed max-w-md mb-10">
              At SYRA, we create jewellery that doesn&apos;t shout. Using advanced anti-tarnish technology, our pieces are designed for the modern individual who values durability as much as aesthetic.
            </p>
            <Link href="/about">
              <button className="border border-[#0A0A0A] px-10 py-3 font-mono text-[10px] uppercase tracking-widest text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-all">
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
              <div className="h-[1px] w-full bg-white/20" />
              <Link href={tier.viewAllHref}>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-bg-2 px-6 py-2 border border-white/20 rounded-[50px] text-xs text-ink hover:bg-accent hover:text-bg transition-colors whitespace-nowrap">
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
        <div className="h-[2px] w-64 bg-white/10 relative overflow-hidden rounded-full">
          <motion.div className="absolute top-0 left-0 h-full bg-accent rounded-full" style={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
        </div>
        <div className="flex gap-3">
          {tiers.map((_, i) => (
            <button key={i} onClick={() => setActiveTier(i)} className={`transition-all duration-500 rounded-full ${activeTier === i ? "w-8 h-2 bg-accent" : "w-2 h-2 bg-white/30 hover:bg-white/50"}`} />
          ))}
        </div>
      </div>
    </section>
  )
}


function ScatterSection({ products: _products }: { products: Product[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursorPx, setCursorPx] = useState({ x: -9999, y: -9999 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setCursorPx({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  type JewelPiece = { src: string; label: string; w: number; x: number; y: number }
  const jewelleryPieces: JewelPiece[] = [
    { src: "/jewellery/gen-diamond-ring.png", label: "Diamond Ring", w: 100, x: 42, y: 38 },
    { src: "/jewellery/gen-pink-heart-ring.png", label: "Pink Heart", w: 90, x: 55, y: 45 },
    { src: "/jewellery/gen-sapphire-ring.png", label: "Sapphire Ring", w: 85, x: 38, y: 52 },
    { src: "/jewellery/gen-diamond-ring.png", label: "Solitaire", w: 75, x: 62, y: 35 },
    { src: "/jewellery/gen-crystal-earrings.png", label: "Crystal Drops", w: 95, x: 48, y: 28 },
    { src: "/jewellery/gen-ruby-earrings.png", label: "Ruby Drops", w: 90, x: 35, y: 42 },
    { src: "/jewellery/gen-crystal-earrings.png", label: "Pavé Studs", w: 70, x: 58, y: 58 },
    { src: "/jewellery/gen-gold-bracelet.png", label: "Gold Chain", w: 110, x: 45, y: 55 },
    { src: "/jewellery/gen-gold-bracelet.png", label: "Tennis", w: 90, x: 52, y: 32 },
    { src: "/jewellery/gen-gold-necklace.png", label: "Emerald Pendant", w: 100, x: 50, y: 48 },
    { src: "/jewellery/gen-gold-necklace.png", label: "Gold Pendant", w: 80, x: 40, y: 60 },
    { src: "/jewellery/gen-gold-bar.png", label: "24K Gold Bar", w: 90, x: 56, y: 52 },
    { src: "/jewellery/gen-gold-bar.png", label: "Gold Bullion", w: 75, x: 44, y: 45 },
    { src: "/jewellery/gen-gold-bar.png", label: "Gold Ingot", w: 65, x: 50, y: 62 },
  ]

  type Gem = { bg: string; glow: string; sz: number; x: number; y: number; label: string }
  const mkDiamond = (sz: number, x: number, y: number): Gem => ({ bg: "radial-gradient(circle at 30% 25%, #fff 0%, #e8f0ff 25%, #b8d4f8 50%, #8aa8d0 75%, #6688aa 100%)", glow: "rgba(200,220,255,0.6)", sz, x, y, label: "Diamond" })
  const mkRuby = (sz: number, x: number, y: number): Gem => ({ bg: "radial-gradient(circle at 30% 25%, #ff8888 0%, #dc143c 25%, #9b0020 55%, #4a0010 100%)", glow: "rgba(220,20,60,0.6)", sz, x, y, label: "Ruby" })
  const mkSapphire = (sz: number, x: number, y: number): Gem => ({ bg: "radial-gradient(circle at 30% 25%, #88aaff 0%, #2244aa 25%, #112266 55%, #081140 100%)", glow: "rgba(34,68,170,0.6)", sz, x, y, label: "Sapphire" })
  const mkEmerald = (sz: number, x: number, y: number): Gem => ({ bg: "radial-gradient(circle at 30% 25%, #66ee99 0%, #1a8844 25%, #0d5528 55%, #062a14 100%)", glow: "rgba(26,136,68,0.6)", sz, x, y, label: "Emerald" })
  const mkPinkDiamond = (sz: number, x: number, y: number): Gem => ({ bg: "radial-gradient(circle at 30% 25%, #ffc8dd 0%, #ff6ea8 25%, #cc3377 55%, #882255 100%)", glow: "rgba(255,110,168,0.6)", sz, x, y, label: "Pink Diamond" })

  const gemstones: Gem[] = [
    mkDiamond(70, 46, 40), mkDiamond(60, 52, 46), mkDiamond(55, 39, 48),
    mkDiamond(50, 58, 38), mkDiamond(65, 44, 55), mkDiamond(50, 54, 55),
    mkRuby(65, 48, 35), mkRuby(55, 36, 44), mkRuby(60, 60, 48),
    mkRuby(50, 42, 58), mkRuby(55, 56, 42),
    mkSapphire(60, 40, 36), mkSapphire(55, 57, 55), mkSapphire(65, 50, 50),
    mkSapphire(50, 35, 52), mkSapphire(55, 62, 40),
    mkEmerald(55, 47, 42), mkEmerald(60, 53, 36), mkEmerald(50, 38, 56),
    mkEmerald(65, 59, 50), mkEmerald(50, 44, 48),
    mkPinkDiamond(60, 50, 38), mkPinkDiamond(55, 42, 50), mkPinkDiamond(50, 56, 58),
    mkPinkDiamond(65, 48, 54), mkPinkDiamond(55, 54, 42),
    mkDiamond(35, 32, 38), mkDiamond(30, 65, 55), mkDiamond(28, 34, 58),
    mkRuby(32, 63, 35), mkRuby(28, 37, 62),
    mkSapphire(30, 60, 62), mkSapphire(35, 33, 42),
    mkEmerald(28, 64, 45), mkEmerald(32, 36, 35),
    mkPinkDiamond(30, 58, 60), mkPinkDiamond(28, 40, 33),
    mkDiamond(25, 30, 50),
  ]

  const REPULSE_R = 140

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCursorPx({ x: -9999, y: -9999 })}
      className="relative w-full min-h-[800px] md:min-h-[900px] bg-bg overflow-hidden flex flex-col items-center justify-center border-t border-line cursor-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_rgba(194,185,167,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-30 text-center pointer-events-none mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/70 block mb-3">Interactive Experience</span>
        <h2 className="font-display text-5xl md:text-8xl text-ink tracking-tight leading-none">
          Dynamic <em className="text-accent">Brilliance</em>
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-4">
          Move your cursor to push the jewels
        </p>
      </div>

      <div className="relative w-full max-w-[1200px] h-[500px] md:h-[600px]">
        {gemstones.map((gem, i) => (
          <RepulsionItem key={`g-${i}`} restX={gem.x} restY={gem.y} cursorPx={cursorPx} containerRef={containerRef} repulseRadius={REPULSE_R * 0.9} mass={0.3 + (gem.sz / 200)} idx={i}>
            <DiamondCut size={gem.sz} glow={gem.glow} variant={gem.label} />
          </RepulsionItem>
        ))}
        {jewelleryPieces.map((piece, i) => (
          <RepulsionItem key={`j-${i}`} restX={piece.x} restY={piece.y} cursorPx={cursorPx} containerRef={containerRef} repulseRadius={REPULSE_R} mass={1.0 + (piece.w / 300)} idx={i + 200}>
            <div className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" style={{ width: piece.w, height: piece.w }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={piece.src} alt={piece.label} className="w-full h-full object-contain select-none" style={{ filter: "contrast(1.1) saturate(1.2)" }} draggable={false} />
            </div>
          </RepulsionItem>
        ))}
      </div>

      {cursorPx.x > 0 && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: cursorPx.x + (containerRef.current?.getBoundingClientRect().left ?? 0) - 24,
            top: cursorPx.y + (containerRef.current?.getBoundingClientRect().top ?? 0) - 24,
          }}
        >
          <div className="w-12 h-12 rounded-full border border-accent/20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-accent/50" />
          </div>
        </motion.div>
      )}
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
  restX, restY, cursorPx, containerRef, repulseRadius, mass, idx, children,
}: {
  restX: number
  restY: number
  cursorPx: { x: number; y: number }
  containerRef: React.RefObject<HTMLDivElement | null>
  repulseRadius: number
  mass: number
  idx: number
  children: React.ReactNode
}) {
  const rect = containerRef.current?.getBoundingClientRect()
  const cw = rect?.width ?? 1200
  const ch = rect?.height ?? 600
  const rx = (restX / 100) * cw
  const ry = (restY / 100) * ch

  const effectiveRadius = repulseRadius * 1.5
  const dx = rx - cursorPx.x
  const dy = ry - cursorPx.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  let offsetX = 0
  let offsetY = 0
  let rotateZ = 0

  if (dist < effectiveRadius && dist > 0) {
    const ratio = (effectiveRadius - dist) / effectiveRadius
    const force = ratio * ratio * 450 / mass
    offsetX = (dx / dist) * force
    offsetY = (dy / dist) * force
    rotateZ = (dx / dist) * force * 0.3
  }

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${restX}%`, top: `${restY}%`, zIndex: dist < repulseRadius ? 20 : 10 }}
      animate={{ x: offsetX, y: offsetY, rotate: rotateZ, scale: dist < repulseRadius && dist > 0 ? 1.05 + (0.1 * ((repulseRadius - dist) / repulseRadius)) : 1 }}
      transition={{ type: "spring", damping: 40, stiffness: 50, mass: mass * 0.6 }}
    >
      <motion.div
        animate={{ y: [0, -4 - (idx % 4) * 1.5, 0], rotate: [0, (idx % 2 === 0 ? 1.5 : -1.5), 0] }}
        transition={{ repeat: Infinity, duration: 4 + (idx % 3), ease: "easeInOut", delay: (idx % 10) * 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
