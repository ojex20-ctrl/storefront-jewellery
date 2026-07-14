import Link from "next/link"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow, Button } from "@podium/ui/primitives"
import { Shield, Droplets, Heart, Clock } from "lucide-react"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "2-Year Anti-Tarnish Warranty",
  description: "SYRA jewellery includes a 2-year anti-tarnish guarantee for eligible coating, clasp and material defects.",
  path: "/warranty",
  image: "/hero/syra_banner_rings.png",
})

const BADGES = [
  { icon: Shield, label: "Anti-Tarnish", desc: "PVD coating guaranteed for 2 years" },
  { icon: Droplets, label: "Waterproof", desc: "Shower, swim, sweat — no damage" },
  { icon: Heart, label: "Hypoallergenic", desc: "Surgical-grade stainless steel base" },
  { icon: Clock, label: "2-Year Warranty", desc: "Free replacement if coating fails" },
]

export default function WarrantyPage() {
  return (
    <div className="overflow-x-hidden">
      <section className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
        <Reveal>
          <Eyebrow className="text-accent mb-6">Our Promise</Eyebrow>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-8">
            2-Year Anti-Tarnish<br /><em className="text-accent">Guarantee</em>.
          </h1>
          <p className="text-lg text-ink-2 leading-relaxed max-w-xl mb-12">
            Every SYRA piece is engineered to last. Our PVD coating technology means your jewellery stays brilliant for years — not months. If it tarnishes within 2 years of purchase, we replace it free.
          </p>
        </Reveal>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-16">
          {BADGES.map((b) => (
            <div key={b.label} className="border border-line p-5 text-center">
              <b.icon size={28} className="mx-auto text-accent mb-3" strokeWidth={1.5} />
              <p className="font-display text-lg mb-1">{b.label}</p>
              <p className="text-xs text-ink-2">{b.desc}</p>
            </div>
          ))}
        </div>

        <Reveal>
          <h2 className="font-display text-3xl mb-6">What&apos;s Covered</h2>
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            <div className="border border-line p-6">
              <h3 className="font-display text-xl text-accent mb-3">✓ Covered</h3>
              <ul className="space-y-2 text-sm text-ink-2">
                <li>• Tarnishing or discoloration within 2 years</li>
                <li>• Peeling or flaking of PVD coating</li>
                <li>• Allergic reactions from material defects</li>
                <li>• Stone falling out due to setting failure</li>
                <li>• Clasp or closure mechanism failure</li>
              </ul>
            </div>
            <div className="border border-line p-6">
              <h3 className="font-display text-xl mb-3">✗ Not Covered</h3>
              <ul className="space-y-2 text-sm text-ink-2">
                <li>• Physical damage (bending, crushing, scratching)</li>
                <li>• Loss or theft</li>
                <li>• Damage from harsh chemicals (bleach, acetone)</li>
                <li>• Normal wear on moving parts after 2 years</li>
                <li>• Modifications made by third parties</li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <h2 className="font-display text-3xl mb-6">How to Claim</h2>
          <div className="grid gap-px bg-line md:grid-cols-3 mb-12">
            {[
              { num: "01", title: "Contact Us", desc: "WhatsApp or email with your order number and photos of the issue." },
              { num: "02", title: "Ship It Back", desc: "We'll send a prepaid return label. Pack the piece in its original pouch." },
              { num: "03", title: "Get Replaced", desc: "We inspect within 3 days. If covered, a new piece ships to you free." },
            ].map((s) => (
              <div key={s.num} className="bg-bg p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{s.num}</span>
                <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="text-center border border-line p-10">
          <p className="font-display text-2xl mb-4">Need to make a claim?</p>
          <p className="text-sm text-ink-2 mb-6">Our team responds within 24 hours.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact"><Button>Contact Us</Button></Link>
            <a href={`https://wa.me/919876543210?text=${encodeURIComponent("Hi, I need to make a warranty claim for my SYRA piece.")}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost">WhatsApp Us →</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
