import { Reveal } from "@podium/ui/motion"
import { Eyebrow } from "@podium/ui/primitives"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Jewellery Size Guide",
  description: "Find ring, bracelet and necklace sizing for SYRA jewellery, including measurement tips and size tables.",
  path: "/size-guide",
  image: "/hero/syra_banner_rings.png",
})

const RING_SIZES = [
  { size: "5", diameter: "15.7mm", circumference: "49.3mm" },
  { size: "6", diameter: "16.5mm", circumference: "51.8mm" },
  { size: "7", diameter: "17.3mm", circumference: "54.4mm" },
  { size: "8", diameter: "18.1mm", circumference: "57.0mm" },
  { size: "9", diameter: "19.0mm", circumference: "59.5mm" },
  { size: "10", diameter: "19.8mm", circumference: "62.1mm" },
  { size: "11", diameter: "20.6mm", circumference: "64.6mm" },
  { size: "12", diameter: "21.4mm", circumference: "67.2mm" },
]

const BRACELET_SIZES = [
  { size: "XS", wrist: "14–15 cm", length: "16 cm" },
  { size: "S", wrist: "15–16 cm", length: "17 cm" },
  { size: "M", wrist: "16–17 cm", length: "18 cm" },
  { size: "L", wrist: "17–18 cm", length: "19 cm" },
  { size: "XL", wrist: "18–19 cm", length: "20 cm" },
]

export default function SizeGuidePage() {
  return (
    <div className="px-4 py-20 md:px-12 md:py-32 max-w-4xl mx-auto">
      <Reveal>
        <Eyebrow className="text-accent mb-6">Fit Guide</Eyebrow>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-tight mb-12">
          Find Your <em className="text-accent">Size</em>.
        </h1>

        {/* Ring Sizes */}
        <section className="mb-16">
          <h2 className="font-display text-3xl mb-6">Ring Sizes</h2>
          <div className="border border-line overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-bg-2">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted">Size</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted">Inner Diameter</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted">Circumference</th>
                </tr>
              </thead>
              <tbody>
                {RING_SIZES.map((r) => (
                  <tr key={r.size} className="border-t border-line">
                    <td className="px-4 py-3 font-display text-lg">{r.size}</td>
                    <td className="px-4 py-3 font-mono text-sm text-ink-2">{r.diameter}</td>
                    <td className="px-4 py-3 font-mono text-sm text-ink-2">{r.circumference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border border-accent/30 bg-accent/5 p-6">
            <h3 className="font-display text-xl mb-3">How to Measure Your Ring Size</h3>
            <ol className="space-y-2 text-sm text-ink-2 list-decimal list-inside">
              <li>Cut a thin strip of paper (about 1cm wide, 10cm long)</li>
              <li>Wrap it snugly around the base of your finger</li>
              <li>Mark where the paper overlaps with a pen</li>
              <li>Measure the length in mm — that&apos;s your circumference</li>
              <li>Match it to the table above</li>
            </ol>
            <p className="mt-4 text-xs text-muted">Tip: Measure at the end of the day when fingers are slightly larger. If between sizes, go up.</p>
          </div>
        </section>

        {/* Bracelet Sizes */}
        <section className="mb-16">
          <h2 className="font-display text-3xl mb-6">Bracelet Sizes</h2>
          <div className="border border-line overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-bg-2">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted">Size</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted">Wrist</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted">Bracelet Length</th>
                </tr>
              </thead>
              <tbody>
                {BRACELET_SIZES.map((r) => (
                  <tr key={r.size} className="border-t border-line">
                    <td className="px-4 py-3 font-display text-lg">{r.size}</td>
                    <td className="px-4 py-3 font-mono text-sm text-ink-2">{r.wrist}</td>
                    <td className="px-4 py-3 font-mono text-sm text-ink-2">{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Necklace */}
        <section>
          <h2 className="font-display text-3xl mb-6">Necklace Lengths</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: "Choker", length: "35–40 cm" },
              { name: "Princess", length: "43–48 cm" },
              { name: "Matinee", length: "50–60 cm" },
              { name: "Opera", length: "70–90 cm" },
            ].map((n) => (
              <div key={n.name} className="border border-line p-5 text-center">
                <p className="font-display text-xl">{n.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">{n.length}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  )
}
