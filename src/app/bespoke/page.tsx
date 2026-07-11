import Link from "next/link"
import { Reveal, Sparkles, Magnetic, Marquee } from "@podium/ui/motion"
import { Eyebrow, Button } from "@podium/ui/primitives"
import { PageBlocks } from "@podium/ui/chrome"
import { getPageContent } from "@/lib/page-content"

export const metadata = { title: "Bespoke — SYRA" }

const STAGES = [
  { num: "01", title: "Brief", copy: "We meet at the atelier in Marampally — sketches, reference pieces, conversation. 1 hour, free of cost." },
  { num: "02", title: "Sketch", copy: "Hand-drawn renderings within five working days. Two revisions included; further passes are charged hourly." },
  { num: "03", title: "Stones", copy: "We source the stones to your spec — certified, ethical, traceable. Selection happens in person." },
  { num: "04", title: "Set", copy: "Casting and setting in the atelier. Six to eight weeks for engagement rings; longer for full bridal sets." },
  { num: "05", title: "Wear", copy: "Final fitting + lifetime resizing on the band. Repolish on request, free of charge, every five years." },
]

export default async function BespokePage() {
  const cms = await getPageContent("bespoke")
  return (
    <div className="overflow-x-hidden">
      <section className="relative border-b border-line px-4 py-32 md:px-12 md:py-48">
        <Sparkles count={48} />
        <div className="relative z-10 mx-auto max-w-[1100px]">
          <Reveal>
            <Eyebrow className="mb-4 block text-accent">Bespoke · By appointment</Eyebrow>
            <p
              className="font-display tracking-tighter"
              style={{ fontSize: "clamp(56px, 8vw, 132px)", lineHeight: 0.95 }}
            >
              Begin with a
              <br />
              <em className="text-accent">sketch.</em>
            </p>
            <p className="mt-6 max-w-[560px] text-base leading-relaxed text-ink-2">
              Engagement rings, bridal sets, and one-of-one pieces — drawn at the atelier and
              cast in solid metal. Six to eight weeks from brief to box.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Magnetic strength={0.3}>
                <Link href="/help/contact">
                  <Button size="lg">Book a brief →</Button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link href="/collection" className="ulink font-mono text-[11px] uppercase tracking-widest text-accent">
                  Or browse the collection →
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="grid gap-px border-b border-line bg-line md:grid-cols-5">
        {STAGES.map((s) => (
          <div key={s.num} className="bg-bg p-8 md:p-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{s.num}</span>
            <h3 className="mt-4 font-display text-2xl tracking-tight md:text-3xl">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{s.copy}</p>
          </div>
        ))}
      </section>

      <Marquee
        items={[
          "BY APPOINTMENT",
          "MARAMPALLY · NEAR PERUMBAVOOR",
          "6–8 WEEKS · ENGAGEMENT TO BOX",
          "LIFETIME RESIZE INCLUDED",
        ]}
        speed={36}
        className="border-b border-line bg-paper py-5 font-display text-[28px] italic"
      />

      <section className="px-4 py-24 text-center md:px-12 md:py-32">
        <Reveal>
          <p className="mx-auto max-w-[640px] font-display text-3xl italic text-ink-2 md:text-4xl">
            &ldquo;Every piece begins with a single sketch. The hand still does most of the work.&rdquo;
          </p>
          <Eyebrow className="mt-6 block text-accent">— SYRA Atelier</Eyebrow>
        </Reveal>
      </section>
      {cms?.blocks && cms.blocks.length > 0 && (
        <PageBlocks blocks={cms.blocks} />
      )}
    </div>
  )
}
