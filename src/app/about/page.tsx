"use client"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"

export default function AboutPage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Our Story</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Modern Elegance,<br />Built to Last.
        </h1>
        
        <div className="grid gap-16 text-ink-2 leading-relaxed text-lg">
          <p>
            SYRA was born from a simple observation: high-quality jewellery should not be a fragile luxury. We believe in pieces that can be worn every day, through every moment of life, without losing their brilliance.
          </p>
          <p>
            Our focus is on anti-tarnish technology. By combining surgical-grade stainless steel with advanced PVD gold plating, we create jewellery that is waterproof, sweat-proof, and hypoallergenic.
          </p>
          <p>
            Every SYRA piece is a testament to our commitment to durability and timeless design. We don&apos;t just sell jewellery; we provide the confidence to wear your stories, anywhere and everywhere.
          </p>
        </div>
      </Reveal>
    </div>
  )
}
