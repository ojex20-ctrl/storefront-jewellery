"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Reveal,
  WordReveal,
  Magnetic,
  Marquee,
  LiveDot,
  Sparkles,
} from "@podium/ui/motion"
import { Eyebrow, Placeholder, Button } from "@podium/ui/primitives"
import { TrustStrip, Testimonials } from "@podium/ui/chrome"
import { priceFmt } from "@podium/ui/lib"
import { useBrand } from "@/providers/brand-provider"

import type { Product } from "@/lib/products"
import { ProductCard } from "@/components/product/product-card"

export function HomeClient({ products }: { products: Product[] }) {
  const featured = products.slice(0, 8)
  const [currentHero, setCurrentHero] = useState(0)
  
  // ─── COLLECTION MASK CAROUSEL LOGIC ───
  const [carouselIndex, setCarouselIndex] = useState(0)

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



  const heroSlides = [
    {
      jewellery: "/jewellery/earrings-3d.svg",
      title: "Earrings",
      sub: "Make a statement with our unique pairs.",
      href: "/collection?category=Earrings",
      // Each slide gets a unique 3D entrance animation
      enter: { rotateY: -60, rotateX: 15, scale: 0.5, y: 80 },
      float: { y: [0, -18, 0], rotateZ: [0, 3, -3, 0] },
      exit: { rotateY: 60, scale: 0.6, y: -60 },
    },
    {
      jewellery: "/jewellery/ring-3d.svg",
      title: "Rings",
      sub: "Silver plated jewels for the eternal shine.",
      href: "/collection?category=Ring",
      enter: { rotateY: 45, rotateX: -20, scale: 0.4, y: 100 },
      float: { y: [0, -22, 0], rotateZ: [0, -4, 4, 0], rotateY: [0, 8, 0] },
      exit: { rotateY: -45, scale: 0.5, y: -80 },
    },
    {
      jewellery: "/jewellery/bracelet-3d.svg",
      title: "Bracelets",
      sub: "Fluidity in gold, designed for life.",
      href: "/collection?category=Bracelet",
      enter: { rotateX: 30, rotateZ: -10, scale: 0.3, y: 120 },
      float: { y: [0, -15, 0], rotateX: [0, 5, -5, 0] },
      exit: { rotateX: -30, scale: 0.4, y: -100 },
    },
    {
      jewellery: "/jewellery/necklace-3d.svg",
      title: "Necklaces",
      sub: "Ethically sourced, endlessly elegant.",
      href: "/collection?category=Necklace",
      enter: { rotateY: -40, rotateZ: 8, scale: 0.5, y: 90 },
      float: { y: [0, -20, 0], rotateZ: [0, 2, -2, 0], scale: [1, 1.02, 1] },
      exit: { rotateY: 40, rotateZ: -8, scale: 0.6, y: -70 },
    },
  ]

  const categoryCircles = [
    { title: "Best Sellers", href: "/collection", img: products.find(p => p.kind === "Bracelet")?.image },
    { title: "Earrings", href: "/collection?category=Earrings", img: products.find(p => p.kind === "Earrings")?.image },
    { title: "Necklace", href: "/collection?category=Necklace", img: products.find(p => p.kind === "Necklace")?.image },
    { title: "Bracelets", href: "/collection?category=Bracelet", img: products.find(p => p.kind === "Bracelet")?.image },
    { title: "Rings", href: "/collection?category=Ring", img: products.find(p => p.kind === "Ring")?.image },
    { title: "Pendants", href: "/collection?category=Necklace", img: products.find(p => p.kind === "Necklace")?.image },
    { title: "New Arrivals", href: "/collection", img: products.find(p => p.kind === "Ring")?.image },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-bg text-ink selection:bg-accent selection:text-bg">
      {/* ─── HERO SLIDER (Editorial Category Flow) ─────────────────────── */}
      <section className="relative w-full aspect-video min-h-[100svh] lg:min-h-0 lg:max-h-[1080px] overflow-hidden flex flex-col items-center justify-center bg-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 cursor-pointer overflow-hidden flex items-center justify-center"
            onClick={() => window.location.href = heroSlides[currentHero]?.href ?? ""}
          >
            {/* Radial gradient background per slide */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,_rgba(201,163,107,0.08)_0%,_transparent_70%)]" />
            
            {/* Animated golden dust particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, pi) => (
                <motion.div
                  key={`p-${currentHero}-${pi}`}
                  className="absolute w-1 h-1 rounded-full bg-accent/60"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                  }}
                  animate={{
                    y: [0, -40 - Math.random() * 60, 0],
                    x: [0, (Math.random() - 0.5) * 30, 0],
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4 + Math.random() * 4,
                    delay: Math.random() * 3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Rotating glow ring behind the jewellery */}
            <motion.div
              className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, rgba(201,163,107,0.12) 25%, transparent 50%, rgba(201,163,107,0.08) 75%, transparent 100%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />
            
            {/* ── The 3D Jewellery Piece ── */}
            <motion.div
              initial={{ ...heroSlides[currentHero]?.enter, opacity: 0 }}
              animate={{ rotateY: 0, rotateX: 0, rotateZ: 0, scale: 1, y: 0, opacity: 1 }}
              exit={{ ...heroSlides[currentHero]?.exit, opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 pointer-events-none"
              style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
            >
              <motion.div
                animate={heroSlides[currentHero]?.float}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="w-[50vw] h-[50vw] max-w-[480px] max-h-[480px] md:max-w-[550px] md:max-h-[550px] drop-shadow-[0_0_80px_rgba(201,163,107,0.25)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroSlides[currentHero]?.jewellery}
                  alt={heroSlides[currentHero]?.title ?? ""}
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
            
            {/* Editorial Text Overlay */}
            <div className="absolute inset-0 pl-[80px] md:pl-[140px] flex flex-col items-center justify-end p-6 pb-[15%] md:pb-[10%] pointer-events-none z-20">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center"
              >
                <h1 className="font-display text-5xl sm:text-7xl md:text-[120px] uppercase tracking-tighter text-white leading-none mb-3 md:mb-5 drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
                  {heroSlides[currentHero]?.title}
                </h1>
                <p className="font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/70 max-w-[220px] md:max-w-md mx-auto">
                  {heroSlides[currentHero]?.sub}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Indicators */}
        <div className="absolute bottom-40 left-[calc(50%+40px)] md:left-[calc(50%+70px)] -translate-x-1/2 z-20 flex gap-4">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentHero(i)}
              className={`h-[2px] transition-all duration-700 ${
                currentHero === i ? "w-16 bg-white" : "w-8 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Left Vertical Category Navigation (Wavy Glass) */}
        <div 
          className="absolute left-0 top-0 bottom-0 z-30 w-[85px] md:w-[140px] bg-[#2B2019]/40 backdrop-blur-md pointer-events-none transition-all"
          style={{
            maskImage: `linear-gradient(to right, black calc(100% - 35px), transparent calc(100% - 35px)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='120' viewBox='0 0 40 120'%3E%3Cpath d='M0,0 L0,120 L20,120 Q40,90 20,60 Q0,30 20,0 Z' fill='black' /%3E%3C/svg%3E")`,
            maskPosition: 'left top, right top',
            maskRepeat: 'no-repeat, repeat-y',
            maskSize: '100% 100%, 40px 120px',
            WebkitMaskImage: `linear-gradient(to right, black calc(100% - 35px), transparent calc(100% - 35px)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='120' viewBox='0 0 40 120'%3E%3Cpath d='M0,0 L0,120 L20,120 Q40,90 20,60 Q0,30 20,0 Z' fill='black' /%3E%3C/svg%3E")`,
            WebkitMaskPosition: 'left top, right top',
            WebkitMaskRepeat: 'no-repeat, repeat-y',
            WebkitMaskSize: '100% 100%, 40px 120px',
          }}
        >
           <div className="w-full h-full overflow-y-auto no-scrollbar pointer-events-auto flex flex-col items-center py-20 md:py-32 gap-6 md:gap-8 px-2">
             {categoryCircles.map((cat, i) => (
               <Link href={cat.href} key={i} className="flex flex-col items-center gap-2 md:gap-3 group w-full pr-[10px]">
                 <div className="w-12 h-12 md:w-[70px] md:h-[70px] rounded-full border border-[#F9F6F0]/40 p-[2px] md:p-[3px] flex items-center justify-center group-hover:border-[#F9F6F0] transition-colors shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white/10 backdrop-blur-sm">
                       <Placeholder 
                          image={cat.img ?? "/placeholder.png"} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          alt={cat.title} 
                       />
                    </div>
                 </div>
                 <span className="text-[#F9F6F0] text-[8px] md:text-[10px] font-medium tracking-wide drop-shadow-lg text-center leading-tight">
                   {cat.title}
                 </span>
               </Link>
             ))}
           </div>
        </div>
      </section>

      {/* ─── COLLECTION CAROUSEL (Mockup Layout) ─────────────────────── */}
      <section className="px-6 py-24 md:px-12 bg-bg">
        <div className="flex items-center gap-6 mb-16 max-w-[1400px] mx-auto w-full">
           <h2 className="font-display text-4xl md:text-5xl text-ink">Collection</h2>
           <div className="flex-1 h-[1px] bg-white/20 relative flex items-center justify-between">
              {/* Decorative Stars */}
              <svg className="absolute left-0 -translate-x-1/2 text-accent w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
              <svg className="absolute left-1/2 -translate-x-1/2 text-accent w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
              <svg className="absolute right-0 translate-x-1/2 text-accent w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" /></svg>
           </div>
        </div>
        
        <div className="overflow-x-auto no-scrollbar pb-12 pt-4 w-full">
           <div className="flex gap-6 w-max mx-auto [--card-w:280px] md:[--card-w:340px] [--gap:24px]">
             {windows.map((shape, i) => (
                <div key={i} className={`w-[var(--card-w)] h-[420px] shrink-0 overflow-hidden relative ${shape} bg-bg shadow-lg border border-white/10 pointer-events-none`}>
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
                           className="w-[var(--card-w)] h-[420px] shrink-0 flex flex-col group cursor-pointer bg-bg-soft"
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
      <section className="grid md:grid-cols-2 bg-bg-soft">
        <div className="aspect-square md:aspect-auto">
          <Placeholder 
            image={products[1]?.image} 
            className="h-full w-full grayscale-[10%]" 
            alt="Editorial Story"
          />
        </div>
        <div className="flex flex-col justify-center p-12 md:p-24 bg-[#E8E2D8]">
          <Reveal>
            <Eyebrow className="text-accent mb-6">Philosophy</Eyebrow>
            <h2 className="font-display text-4xl md:text-6xl tracking-tight leading-[1.1] text-[#1A1A1C] mb-8">
              Quiet luxury,<br />understated confidence.
            </h2>
            <p className="text-[#1A1A1C]/70 text-lg leading-relaxed max-w-md mb-10">
              At SYRA, we create jewellery that doesn&apos;t shout. Using advanced anti-tarnish technology, our pieces are designed for the modern individual who values durability as much as aesthetic.
            </p>
            <Link href="/about">
              <button className="border border-[#1A1A1C] px-10 py-3 font-mono text-[10px] uppercase tracking-widest text-[#1A1A1C] hover:bg-[#1A1A1C] hover:text-white transition-all">
                The Story
              </button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ─── HIGHLIGHT BANNER ────────────────────────────────────────── */}
      <section className="py-32 text-center bg-[#0B0B0C]">
        <Reveal>
          <h3 className="font-display text-3xl md:text-5xl text-accent tracking-widest uppercase">
            New Arrivals
          </h3>
          <Link href="/collection">
            <button className="mt-8 font-mono text-[11px] uppercase tracking-[0.4em] text-muted hover:text-accent transition-colors">
              Explore Now
            </button>
          </Link>
        </Reveal>
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

  const tiers = [
    {
      heading: ["Gifts Under", "₹499"],
      viewAllHref: "/collection?price_max=499",
      items: [
        {
          title: "Gold Plated Anti Tarnish Heart Themed Wraparound Bracelet",
          price: "₹469",
          oldPrice: "₹1,369",
          badgeLeft: "BEST SELLER",
          badgeRight: "66% OFF",
          img: products.find(p => p.kind === "Bracelet")?.image ?? "/placeholder.png",
        },
        {
          title: "Stainless Steel Contemporary Rose Gold Love AD Bracelet",
          price: "₹429",
          oldPrice: "₹2,159",
          badgeLeft: "",
          badgeRight: "80% OFF",
          img: products.find(p => p.kind === "Ring")?.image ?? "/placeholder.png",
        },
        {
          title: "Gold Plated Anti Tarnish Heart Themed Bow Necklace",
          price: "₹469",
          oldPrice: "₹1,369",
          badgeLeft: "",
          badgeRight: "66% OFF",
          img: products.find(p => p.kind === "Necklace")?.image ?? "/placeholder.png",
        },
        {
          title: "Gold-Plated Anti Tarnish Pink Heart CZ Pendant",
          price: "₹429",
          oldPrice: "₹1,369",
          badgeLeft: "BEST SELLER",
          badgeRight: "69% OFF",
          img: products.find(p => p.kind === "Earrings")?.image ?? "/placeholder.png",
        },
      ],
    },
    {
      heading: ["Under", "₹899"],
      viewAllHref: "/collection?price_max=899",
      items: [
        {
          title: "18k Gold Plated Minimalist Stacking Ring Set",
          price: "₹799",
          oldPrice: "₹1,899",
          badgeLeft: "TRENDING",
          badgeRight: "58% OFF",
          img: products.find(p => p.kind === "Ring")?.image ?? "/placeholder.png",
        },
        {
          title: "Rose Gold Anti Tarnish Twisted Hoop Earrings",
          price: "₹699",
          oldPrice: "₹1,599",
          badgeLeft: "",
          badgeRight: "56% OFF",
          img: products.find(p => p.kind === "Earrings")?.image ?? "/placeholder.png",
        },
        {
          title: "Surgical Steel Layered Chain Bracelet with Charm",
          price: "₹849",
          oldPrice: "₹2,499",
          badgeLeft: "NEW",
          badgeRight: "66% OFF",
          img: products.find(p => p.kind === "Bracelet")?.image ?? "/placeholder.png",
        },
        {
          title: "Sterling Silver Pearl Drop Pendant Necklace",
          price: "₹799",
          oldPrice: "₹1,999",
          badgeLeft: "",
          badgeRight: "60% OFF",
          img: products.find(p => p.kind === "Necklace")?.image ?? "/placeholder.png",
        },
      ],
    },
    {
      heading: ["Premium", "₹1,000+"],
      viewAllHref: "/collection?price_min=1000",
      items: [
        {
          title: "18k Gold Vermeil Solitaire Diamond Band",
          price: "₹1,299",
          oldPrice: "₹3,499",
          badgeLeft: "BEST SELLER",
          badgeRight: "63% OFF",
          img: products.find(p => p.kind === "Ring")?.image ?? "/placeholder.png",
        },
        {
          title: "White Gold Plated Emerald Cut CZ Tennis Bracelet",
          price: "₹1,499",
          oldPrice: "₹4,299",
          badgeLeft: "ONE OF ONE",
          badgeRight: "65% OFF",
          img: products.find(p => p.kind === "Bracelet")?.image ?? "/placeholder.png",
        },
        {
          title: "Rose Gold Sapphire Cluster Drop Earrings",
          price: "₹1,199",
          oldPrice: "₹3,199",
          badgeLeft: "",
          badgeRight: "63% OFF",
          img: products.find(p => p.kind === "Earrings")?.image ?? "/placeholder.png",
        },
        {
          title: "22k Gold Plated Vintage Locket Pendant Necklace",
          price: "₹1,599",
          oldPrice: "₹4,999",
          badgeLeft: "NEW",
          badgeRight: "68% OFF",
          img: products.find(p => p.kind === "Necklace")?.image ?? "/placeholder.png",
        },
      ],
    },
  ]

  // Auto-cycle every 5 seconds
  useEffect(() => {
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + (100 / 50) // 50 steps over 5 seconds (100ms each)
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

  const tier = tiers[activeTier]!
  const slideDirection = 1 // always slide left

  return (
    <section className="px-6 py-16 md:px-12 bg-bg-2 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier}
          initial={{ x: slideDirection * 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: slideDirection * -300, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Header */}
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

          {/* Product cards */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory max-w-[1400px] mx-auto scroll-smooth"
          >
            {tier.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] snap-start flex flex-col gap-4 shrink-0"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-bg">
                  <Placeholder
                    image={item.img}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                    {item.badgeLeft ? (
                      <span className="bg-bg/90 text-[10px] font-bold px-2 py-1 rounded-[4px] text-ink">{item.badgeLeft}</span>
                    ) : <div />}
                    {item.badgeRight ? (
                      <span className="bg-bg/90 text-[10px] font-bold px-2 py-1 rounded-[4px] text-ink">{item.badgeRight}</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-sm text-ink/80 leading-tight line-clamp-2 h-10">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-base text-ink">{item.price}</span>
                    <span className="text-xs text-ink/50 line-through">{item.oldPrice}</span>
                  </div>
                </div>
                <button className="w-full bg-accent text-bg py-3 rounded-md text-xs font-bold tracking-wider hover:bg-opacity-80 transition-colors mt-auto">
                  ADD TO CART
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Tier indicators + progress */}
      <div className="flex justify-center items-center gap-6 mt-8 max-w-[1400px] mx-auto">
        {/* Progress bar */}
        <div className="h-[2px] w-64 bg-white/10 relative overflow-hidden rounded-full">
          <motion.div
            className="absolute top-0 left-0 h-full bg-accent rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        {/* Dot indicators */}
        <div className="flex gap-3">
          {tiers.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTier(i)}
              className={`transition-all duration-500 rounded-full ${
                activeTier === i
                  ? "w-8 h-2 bg-accent"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
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

  // ── AI-generated jewellery pieces (black bg → mix-blend-mode:screen) ──
  type JewelPiece = { src: string; label: string; w: number; x: number; y: number }
  const jewelleryPieces: JewelPiece[] = [
    // Rings
    { src: "/jewellery/gen-diamond-ring.png", label: "Diamond Ring", w: 100, x: 42, y: 38 },
    { src: "/jewellery/gen-pink-heart-ring.png", label: "Pink Heart", w: 90, x: 55, y: 45 },
    { src: "/jewellery/gen-sapphire-ring.png", label: "Sapphire Ring", w: 85, x: 38, y: 52 },
    { src: "/jewellery/gen-diamond-ring.png", label: "Solitaire", w: 75, x: 62, y: 35 },
    // Earrings
    { src: "/jewellery/gen-crystal-earrings.png", label: "Crystal Drops", w: 95, x: 48, y: 28 },
    { src: "/jewellery/gen-ruby-earrings.png", label: "Ruby Drops", w: 90, x: 35, y: 42 },
    { src: "/jewellery/gen-crystal-earrings.png", label: "Pavé Studs", w: 70, x: 58, y: 58 },
    // Bracelets
    { src: "/jewellery/gen-gold-bracelet.png", label: "Gold Chain", w: 110, x: 45, y: 55 },
    { src: "/jewellery/gen-gold-bracelet.png", label: "Tennis", w: 90, x: 52, y: 32 },
    // Necklaces
    { src: "/jewellery/gen-gold-necklace.png", label: "Emerald Pendant", w: 100, x: 50, y: 48 },
    { src: "/jewellery/gen-gold-necklace.png", label: "Gold Pendant", w: 80, x: 40, y: 60 },
    // Gold Bars
    { src: "/jewellery/gen-gold-bar.png", label: "24K Gold Bar", w: 90, x: 56, y: 52 },
    { src: "/jewellery/gen-gold-bar.png", label: "Gold Bullion", w: 75, x: 44, y: 45 },
    { src: "/jewellery/gen-gold-bar.png", label: "Gold Ingot", w: 65, x: 50, y: 62 },
  ]

  // ── Large gemstones (50-80px, pure CSS) ──
  type Gem = { bg: string; glow: string; sz: number; x: number; y: number; label: string }

  const mkDiamond = (sz: number, x: number, y: number): Gem => ({
    bg: "radial-gradient(circle at 30% 25%, #fff 0%, #e8f0ff 25%, #b8d4f8 50%, #8aa8d0 75%, #6688aa 100%)",
    glow: "rgba(200,220,255,0.6)", sz, x, y, label: "Diamond",
  })
  const mkRuby = (sz: number, x: number, y: number): Gem => ({
    bg: "radial-gradient(circle at 30% 25%, #ff8888 0%, #dc143c 25%, #9b0020 55%, #4a0010 100%)",
    glow: "rgba(220,20,60,0.6)", sz, x, y, label: "Ruby",
  })
  const mkSapphire = (sz: number, x: number, y: number): Gem => ({
    bg: "radial-gradient(circle at 30% 25%, #88aaff 0%, #2244aa 25%, #112266 55%, #081140 100%)",
    glow: "rgba(34,68,170,0.6)", sz, x, y, label: "Sapphire",
  })
  const mkEmerald = (sz: number, x: number, y: number): Gem => ({
    bg: "radial-gradient(circle at 30% 25%, #66ee99 0%, #1a8844 25%, #0d5528 55%, #062a14 100%)",
    glow: "rgba(26,136,68,0.6)", sz, x, y, label: "Emerald",
  })
  const mkPinkDiamond = (sz: number, x: number, y: number): Gem => ({
    bg: "radial-gradient(circle at 30% 25%, #ffc8dd 0%, #ff6ea8 25%, #cc3377 55%, #882255 100%)",
    glow: "rgba(255,110,168,0.6)", sz, x, y, label: "Pink Diamond",
  })

  const gemstones: Gem[] = [
    // Big diamonds (piled near center)
    mkDiamond(70, 46, 40), mkDiamond(60, 52, 46), mkDiamond(55, 39, 48),
    mkDiamond(50, 58, 38), mkDiamond(65, 44, 55), mkDiamond(50, 54, 55),
    // Rubies
    mkRuby(65, 48, 35), mkRuby(55, 36, 44), mkRuby(60, 60, 48),
    mkRuby(50, 42, 58), mkRuby(55, 56, 42),
    // Sapphires
    mkSapphire(60, 40, 36), mkSapphire(55, 57, 55), mkSapphire(65, 50, 50),
    mkSapphire(50, 35, 52), mkSapphire(55, 62, 40),
    // Emeralds
    mkEmerald(55, 47, 42), mkEmerald(60, 53, 36), mkEmerald(50, 38, 56),
    mkEmerald(65, 59, 50), mkEmerald(50, 44, 48),
    // Pink diamonds
    mkPinkDiamond(60, 50, 38), mkPinkDiamond(55, 42, 50), mkPinkDiamond(50, 56, 58),
    mkPinkDiamond(65, 48, 54), mkPinkDiamond(55, 54, 42),
    // Smaller accent gems scattered around edges of pile
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
      className="relative w-full min-h-[800px] md:min-h-[900px] bg-bg overflow-hidden flex flex-col items-center justify-center border-t border-white/5 cursor-none"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_rgba(201,163,107,0.07)_0%,_transparent_70%)] pointer-events-none" />

      {/* Heading */}
      <div className="relative z-30 text-center pointer-events-none mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent/70 block mb-3">Interactive Experience</span>
        <h2 className="font-display text-5xl md:text-8xl text-ink tracking-tight leading-none">
          Dynamic <em className="text-accent">Brilliance</em>
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-4">
          Move your cursor to push the jewels
        </p>
      </div>

      {/* ── Pile field ── */}
      <div className="relative w-full max-w-[1200px] h-[500px] md:h-[600px]">

        {/* Gemstones first (behind jewellery) */}
        {gemstones.map((gem, i) => (
          <RepulsionItem
            key={`g-${i}`}
            restX={gem.x} restY={gem.y}
            cursorPx={cursorPx} containerRef={containerRef}
            repulseRadius={REPULSE_R * 0.9}
            mass={0.3 + (gem.sz / 200)}
            idx={i}
          >
            <div
              className="rounded-full"
              style={{
                width: gem.sz, height: gem.sz,
                background: gem.bg,
                boxShadow: `0 0 ${gem.sz * 0.6}px ${gem.glow}, 0 0 ${gem.sz * 0.3}px ${gem.glow}, inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 3px 4px rgba(255,255,255,0.35)`,
              }}
            />
          </RepulsionItem>
        ))}

        {/* Jewellery pieces (on top) */}
        {jewelleryPieces.map((piece, i) => (
          <RepulsionItem
            key={`j-${i}`}
            restX={piece.x} restY={piece.y}
            cursorPx={cursorPx} containerRef={containerRef}
            repulseRadius={REPULSE_R}
            mass={1.0 + (piece.w / 300)}
            idx={i + 200}
          >
            <div
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              style={{ width: piece.w, height: piece.w }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={piece.src}
                alt={piece.label}
                className="w-full h-full object-contain select-none"
                style={{ filter: "contrast(1.1) saturate(1.2)" }}
                draggable={false}
              />
            </div>
          </RepulsionItem>
        ))}
      </div>

      {/* Custom cursor */}
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

/** Per-item cursor-proximity repulsion with smooth spring physics */
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

  // Make it more sensitive by increasing the effective repulsion radius for calculation
  const effectiveRadius = repulseRadius * 1.5

  const dx = rx - cursorPx.x
  const dy = ry - cursorPx.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  let offsetX = 0
  let offsetY = 0
  let rotateZ = 0

  if (dist < effectiveRadius && dist > 0) {
    // Smooth cubic falloff for more organic feel
    const ratio = (effectiveRadius - dist) / effectiveRadius
    // Increased force multiplier for further movement
    const force = ratio * ratio * 450 / mass
    offsetX = (dx / dist) * force
    offsetY = (dy / dist) * force
    rotateZ = (dx / dist) * force * 0.3
  }

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${restX}%`, top: `${restY}%`, zIndex: dist < repulseRadius ? 20 : 10 }}
      animate={{
        x: offsetX,
        y: offsetY,
        rotate: rotateZ,
        scale: dist < repulseRadius && dist > 0 ? 1.1 + (0.15 * ((repulseRadius - dist) / repulseRadius)) : 1,
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 80,
        mass: mass,
      }}
    >
      <motion.div
        animate={{
          y: [0, -4 - (idx % 4) * 1.5, 0],
          rotate: [0, (idx % 2 === 0 ? 1.5 : -1.5), 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4 + (idx % 3),
          ease: "easeInOut",
          delay: (idx % 10) * 0.3,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

