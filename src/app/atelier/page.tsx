import Link from "next/link"
import { Reveal, Sparkles, Magnetic, Marquee } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "SYRA Atelier",
  description: "Discover the SYRA atelier process for hand-sketched, anti-tarnish jewellery and bespoke commissions.",
  path: "/atelier",
  image: "/hero/syra_hero_2.png",
})

export default function AtelierPage() {
  return (
    <div className="overflow-x-hidden">
      <section className="relative border-b border-line px-4 py-28 md:px-12 md:py-44 bg-bg text-ink">
        <Sparkles count={48} />
        <div className="relative z-10 mx-auto max-w-[1100px]">
          <Reveal>
            <Eyebrow className="mb-4 block text-accent">Atelier · SYRA</Eyebrow>
            <p
              className="font-display tracking-tighter"
              style={{ fontSize: "clamp(56px, 8vw, 132px)", lineHeight: 0.95 }}
            >
              Sketch.
              <br />
              <em className="text-accent">Set.</em>
              <br />
              Sculpt.
            </p>
            <p className="mt-6 max-w-[560px] text-base leading-relaxed text-ink-2">
              Every SYRA piece begins with a hand-drawn sketch. Bespoke commissions
              take 6 to 8 weeks; our anti-tarnish collections are ready for immediate dispatch.
            </p>
            <Magnetic strength={0.3}>
              <Link
                href="/help/contact"
                className="mt-9 inline-flex font-mono text-[11px] uppercase tracking-widest text-accent ulink"
              >
                Begin a commission →
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      <Marquee
        items={[
          "HAND-SET · ANTI-TARNISH · SYRA",
          "WATERPROOF LUXURY · DAILY WEAR",
          "BESPOKE COMMISSIONS OPEN",
        ]}
        speed={36}
        className="border-b border-line bg-bg-2 py-5 font-display text-[28px] italic text-ink"
      />
    </div>
  )
}
