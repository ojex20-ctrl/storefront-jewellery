import { Reveal } from "@podium/ui/motion"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Jewellery Care Guide",
  description: "Learn how to care for SYRA anti-tarnish jewellery, including PVD coating, cleaning, storage and daily wear tips.",
  path: "/care-guide",
  image: "/jewellery/gen-gold-necklace.png",
})

export default function CareGuidePage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-accent mb-6">Care & Materials</p>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Jewellery that lasts,<br />designed for life.
        </h1>
        
        <div className="grid gap-16">
          <section>
            <h2 className="font-display text-3xl mb-6">Anti-Tarnish Technology</h2>
            <p className="text-ink-2 leading-relaxed text-lg mb-4">
              At SYRA, we use Physical Vapor Deposition (PVD) coating for our gold pieces. This is a vacuum coating process that produces a brilliant decorative and functional finish.
            </p>
            <p className="text-ink-2 leading-relaxed text-lg">
              Unlike traditional gold plating, PVD is significantly more resistant to corrosion from sweat and regular wear. It is waterproof, sweat-proof, and designed for daily use.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl mb-6">How to Care for Your SYRA Pieces</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-2">Daily Wear</h3>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Our anti-tarnish range can be worn in the shower and at the gym. However, avoid direct contact with harsh chemicals like bleach or strong perfumes to maintain the luster.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-2">Cleaning</h3>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Simply wipe with a soft, dry microfibre cloth after wearing. For a deeper clean, use lukewarm water and mild soap, then pat dry immediately.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-2">Storage</h3>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Store your pieces in the SYRA pouch provided or a lined jewellery box. Keep pieces separate to avoid scratching.
                </p>
              </div>
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-2">Swimming</h3>
                <p className="text-sm text-ink-2 leading-relaxed">
                  While our pieces are waterproof, we recommend rinsing with fresh water after swimming in chlorine or saltwater to remove residues.
                </p>
              </div>
            </div>
          </section>
        </div>
      </Reveal>
    </div>
  )
}
