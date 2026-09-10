"use client"

import Link from "next/link"
import { ArrowUpRight, FileDown, MapPin, Phone, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { Reveal } from "@podium/ui/motion"
import { ContactForm } from "@/app/contact/contact-form"

export const MARBLE_BRAND = "Sagar Samrat Marble"
export const MARBLE_LOGO = "/marble/sagar-samrat-logo.jpeg"
export const CATALOGUE_URL = "/marble/sagar-samrat-catalogue.pdf"

export const MARBLE_NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Products",
    href: "/#home-mandirs",
    children: [
      { label: "Home Size Mandirs", href: "/#home-mandirs" },
      { label: "Mandir Rooms", href: "/#mandir-rooms" },
      { label: "Marble Wall Art", href: "/#wall-art" },
      { label: "Inlay Marble Work", href: "/#inlay-work" },
    ],
  },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Contact Us", href: "/contact" },
]

// Catalogue presentation only: these are not storefront product or cart records.
type CatalogueItem = { image: string; name: string; detail: string; price?: string; page: number }
const photo = (page: number, image = 1) => `/marble/catalogue-${String(page).padStart(2, "0")}-${String(image).padStart(2, "0")}.jpg`

const homeMandirs: CatalogueItem[] = [
  { image: photo(3), name: "Home Size Mandir", detail: "3 x 5 ft", price: "INR 2 lakh", page: 3 },
  { image: photo(3, 2), name: "Home Size Mandir", detail: "4 x 5 ft", price: "INR 2.5 lakh", page: 3 },
  { image: photo(4), name: "Home Size Mandir", detail: "3 x 4.5", price: "INR 1.5 lakh", page: 4 },
  { image: photo(4, 2), name: "Home Size Mandir", detail: "4 x 4.5", price: "INR 1.7 lakh", page: 4 },
]
const rooms: CatalogueItem[] = [
  { image: photo(5), name: "Spacious Mandir Room", detail: "7 x 10", price: "INR 10 lakh", page: 5 },
  { image: photo(5, 2), name: "Spacious Mandir Room", detail: "7 x 10", price: "INR 12.5 lakh", page: 5 },
  { image: photo(6), name: "Spacious Mandir Room", detail: "7 x 10", price: "INR 9 lakh", page: 6 },
  { image: photo(6, 2), name: "Spacious Mandir Room", detail: "7 x 10", price: "INR 14 lakh", page: 6 },
]
const wallArt: CatalogueItem[] = [
  { image: photo(7), name: "Carved Marble Wall Art", detail: "Marble carving", price: "INR 5,000 / sq ft", page: 7 },
  { image: photo(7, 2), name: "Carved Marble Wall Art", detail: "Marble carving", price: "INR 5,000 / sq ft", page: 7 },
  { image: photo(8), name: "Sandstone Wall Art", detail: "Sandstone", price: "INR 1,700 / sq ft", page: 8 },
  { image: photo(8, 2), name: "Sandstone Wall Art", detail: "Sandstone", price: "INR 1,500 / sq ft", page: 8 },
]
const inlay: CatalogueItem[] = [
  { image: photo(9), name: "White MOP Inlay", detail: "White mother of pearl", price: "INR 3,000 / sq ft", page: 9 },
  { image: photo(9, 2), name: "Brass & MOP Inlay", detail: "Brass and mother of pearl", price: "INR 4,500 / sq ft", page: 9 },
  { image: photo(10), name: "Floral Inlay Marble Work", detail: "2026 collection", page: 10 },
  { image: photo(10, 2), name: "Inlay Marble Mandir", detail: "2026 collection", page: 10 },
]

function CatalogueImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  // Photographs are extracted unaltered from the supplied catalogue.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={className} />
}

function CatalogueCard({ item }: { item: CatalogueItem }) {
  return (
    <article className="card group flex min-w-0 flex-col gap-3">
      <a href={`${CATALOGUE_URL}#page=${item.page}`} target="_blank" rel="noopener noreferrer" className="marble-catalogue-image relative block aspect-[3/4] overflow-hidden border border-line/70 bg-bg-2">
        <CatalogueImage src={item.image} alt={`${item.name}, ${item.detail}`} className="h-full w-full object-contain" />
        <span className="marble-card-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
      </a>
      <div className="marble-card-caption">
        <p className="marble-card-detail">{item.detail}</p>
        <h3>{item.name}</h3>
        {item.price && <p className="marble-card-price"><span>Starting at</span> {item.price}</p>}
      </div>
    </article>
  )
}

function CollectionSection({ id, eyebrow, title, items, marble = false, stacked = false, stackIndex = 0 }: { id: string; eyebrow: string; title: string; items: CatalogueItem[]; marble?: boolean; stacked?: boolean; stackIndex?: number }) {
  return (
    <motion.section
      id={id}
      className={`marble-section ${marble ? "marble-texture" : "marble-white"} ${stacked ? "marble-stack-section" : ""}`}
      style={stacked ? { zIndex: stackIndex + 1 } : undefined}
      initial={stacked ? { y: 72, scale: 0.975, opacity: 0.72 } : false}
      whileInView={stacked ? { y: 0, scale: 1, opacity: 1 } : undefined}
      viewport={stacked ? { amount: 0.08 } : undefined}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="marble-inner">
        <Reveal><div className="marble-heading"><p className="marble-eyebrow">{eyebrow}</p><h2>{title}</h2><span className="marble-heading-rule" /></div></Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{items.map(item => <CatalogueCard key={item.image} item={item} />)}</div>
        <div className="marble-section-action"><a className="marble-button marble-button-outline" href={CATALOGUE_URL} target="_blank" rel="noopener noreferrer">View Catalogue <FileDown size={16} /></a></div>
      </div>
    </motion.section>
  )
}

export function MarbleIntroduction() {
  return (
    <>
      <section id="craftsmanship" className="marble-section marble-white">
        <div className="marble-inner">
          <Reveal><div className="marble-heading"><p className="marble-eyebrow">Premium Makrana Marble Artisans</p><h2>Our Craftsmanship</h2><p>Generations of traditional artistry. Sacred craftsmanship. Refined precision.</p></div></Reveal>
          <div className="marble-process grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              ["01", "Makrana White Marble", "Rooted in Makrana, Rajasthan."],
              ["02", "Handcrafted Carvings", "Exquisite marble carving and traditional artistry."],
              ["03", "Fine Inlay Work", "Finely detailed marble inlay, brass and mother of pearl."],
              ["04", "Pan India", "Marble creations executed across India."],
            ].map(([n, title, text]) => <div key={n}><span className="marble-process-number">{n}</span><h3>{title}</h3><p>{text}</p></div>)}
          </div>
        </div>
      </section>
      <section id="about" className="marble-section marble-texture">
        <div className="marble-inner">
          <Reveal><div className="marble-heading"><p className="marble-eyebrow">Since the 1980s</p><h2>Welcome to Sagar Samrat Marble</h2><p>Makrana White Marble Mandirs, handcrafted marble carvings, and finely detailed inlay work.</p></div></Reveal>
          <div className="marble-editorial grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="marble-editorial-photo"><CatalogueImage src={photo(2)} alt="Traditional stone carving by an artisan, from the Sagar Samrat Marble catalogue" /></div>
            <div className="marble-editorial-copy"><p className="marble-eyebrow">Faith. Heritage. Lasting elegance.</p><h3>Artistry that spans generations.</h3><p>Sagar Samrat Marble has been a revered name since the 1980s, specializing in the creation of Makrana White Marble Mandirs, exquisite handcrafted marble carvings, and finely detailed marble inlay work.</p><p>With operations based in Mumbai, Maharashtra, and Makrana, Rajasthan, we blend sacred craftsmanship with refined precision to create timeless marble art.</p><Link className="marble-button marble-button-outline" href="/about">Our Story <ArrowUpRight size={16} /></Link></div>
          </div>
        </div>
      </section>
    </>
  )
}

export function MarbleCollections() {
  return (
    <>
      <CollectionSection id="mandir-rooms" eyebrow="Sacred spaces" title="Spacious Mandir Rooms" items={rooms} />
      <section id="catalogue" className="marble-section marble-texture">
        <div className="marble-inner marble-editorial grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="marble-editorial-copy"><p className="marble-eyebrow">2026 Collection</p><h2>A closer look at our marble art.</h2><p>Explore our premium &amp; luxury handcraft marble mandir and art. Discover home-size mandirs, spacious mandir rooms, carved wall art, and intricate inlay work in our catalogue.</p><a className="marble-button" href={CATALOGUE_URL} target="_blank" rel="noopener noreferrer">Explore the Catalogue <FileDown size={16} /></a></div>
          <div className="marble-editorial-photo marble-feature-photo"><CatalogueImage src={photo(6, 2)} alt="White marble mandir room with intricate carvings and warm lighting" /></div>
        </div>
      </section>
      <div className="marble-stack">
        <CollectionSection id="home-mandirs" eyebrow="A space for devotion" title="Home Size Mandirs" items={homeMandirs} stacked stackIndex={0} />
        <CollectionSection id="wall-art" eyebrow="Carved in stone" title="Luxury Marble Wall Art" items={wallArt} marble stacked stackIndex={1} />
        <CollectionSection id="inlay-work" eyebrow="The art of detail" title="Inlay Marble Work" items={inlay} stacked stackIndex={2} />
      </div>
    </>
  )
}

export function MarbleCataloguePageContent() {
  return (
    <div className="marble-page">
      <section className="marble-page-hero marble-texture">
        <div className="marble-inner">
          <Reveal>
            <p className="marble-eyebrow">Sagar Samrat Marble</p>
            <h1>Catalogue</h1>
            <p>Explore our premium &amp; luxury handcraft marble mandir and art.</p>
            <a className="marble-button" href={CATALOGUE_URL} target="_blank" rel="noopener noreferrer">Download 2026 Catalogue <FileDown size={16} /></a>
          </Reveal>
        </div>
      </section>
      <CollectionSection id="catalogue-home-mandirs" eyebrow="A space for devotion" title="Home Size Mandirs" items={homeMandirs} />
      <CollectionSection id="catalogue-mandir-rooms" eyebrow="Sacred spaces" title="Spacious Mandir Rooms" items={rooms} marble />
      <CollectionSection id="catalogue-wall-art" eyebrow="Carved in stone" title="Luxury Marble Wall Art" items={wallArt} />
      <CollectionSection id="catalogue-inlay" eyebrow="The art of detail" title="Inlay Marble Work" items={inlay} marble />
    </div>
  )
}

export function MarbleClosingSections() {
  return (
    <>
      <section id="why-us" className="marble-section marble-texture">
        <div className="marble-inner"><div className="marble-heading"><p className="marble-eyebrow">Our heritage</p><h2>Why Makrana Marble</h2><p>Purity, devotion, and an uncompromising commitment to excellence.</p></div><div className="marble-values grid grid-cols-1 gap-8 md:grid-cols-3"><div><strong>Since the 1980s</strong><p>A name rooted in generations of traditional artistry.</p></div><div><strong>Mumbai &amp; Makrana</strong><p>Sales in Mumbai. Mines and operations in Makrana, Rajasthan.</p></div><div><strong>Across India</strong><p>Marble creations executed Pan India, reflecting faith and heritage.</p></div></div></div>
      </section>
      <section id="projects" className="marble-section marble-white">
        <div className="marble-inner"><div className="marble-heading"><p className="marble-eyebrow">From our catalogue</p><h2>Explore Our Creations</h2></div><div className="marble-project-grid grid gap-5 md:grid-cols-3">{[rooms[1]!, wallArt[0]!, inlay[3]!].map(item => <a href={`${CATALOGUE_URL}#page=${item.page}`} key={item.image} className="marble-project" target="_blank" rel="noopener noreferrer"><CatalogueImage src={item.image} alt={item.name} /><div><h3>{item.name}</h3><ArrowUpRight size={20} /></div></a>)}</div></div>
      </section>
      <section className="marble-section marble-texture" id="our-team">
        <div className="marble-inner"><div className="marble-heading"><p className="marble-eyebrow">The people behind the craft</p><h2>Our Founder &amp; Team</h2></div><div className="marble-team grid grid-cols-1 gap-8 md:grid-cols-3">{[
          { name: "Gaffar Khatri", role: "Founder", image: photo(11, 8) },
          { name: "Aamir Khatri", role: "Co-Founder", image: photo(11) },
          { name: "Gazi Khatri", role: "BDM", image: photo(11, 2) },
        ].map(person => <figure key={person.name}><CatalogueImage src={person.image} alt={person.name} /><figcaption><h3>{person.name}</h3><p>{person.role}</p></figcaption></figure>)}</div></div>
      </section>
      <section id="faq" className="marble-section marble-white">
        <div className="marble-inner marble-faq"><div className="marble-heading"><p className="marble-eyebrow">Your questions</p><h2>Frequently Asked Questions</h2></div>{[
          ["What does Sagar Samrat Marble create?", "Makrana White Marble Mandirs, handcrafted marble carvings, and finely detailed marble inlay work."],
          ["Where are your operations based?", "Our sales office is in Mumbai, Maharashtra. Our mines and operation unit are in Makrana, Rajasthan."],
          ["Do you work across India?", "Yes. Our catalogue describes our creations as executed Pan India."],
          ["Where can I find sizes and starting prices?", "The 2026 catalogue includes home-size mandirs, spacious mandir rooms, wall art, and inlay work with sizes and starting prices for the featured designs."],
        ].map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>
      <section id="contact" className="marble-section marble-texture">
        <div className="marble-inner"><div className="marble-heading"><p className="marble-eyebrow">Mumbai &amp; Makrana</p><h2>Contact Sagar Samrat Marble</h2></div><div className="marble-contact-grid grid gap-8 md:grid-cols-3"><div id="sales-office"><MapPin size={20} /><h3>Sales Office</h3><p>WE Highway, Vile Parle (E)<br />Mumbai, Maharashtra</p></div><div id="operation-unit"><MapPin size={20} /><h3>Mines &amp; Operation Unit</h3><p>By Pass Road, near Jhalara Talab<br />Makrana, Rajasthan</p></div><div><Phone size={20} /><h3>Speak with us</h3><a href="tel:+919082025886">+91 90820 25886</a><a href="tel:+919987962204">+91 99879 62204</a><a className="marble-email" href="mailto:sagarsamratmarble@gmail.com"><Mail size={15} />sagarsamratmarble@gmail.com</a></div></div><ContactForm email="sagarsamratmarble@gmail.com" phone="+91 90820 25886 / +91 99879 62204" /></div>
      </section>
    </>
  )
}
