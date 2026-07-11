import Link from "next/link"
import { Reveal, Sparkles } from "@podium/ui/motion"
import { Eyebrow, Placeholder } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { fetchProducts } from "@/lib/medusa-products"
import { PageBlocks } from "@podium/ui/chrome"
import { getPageContent } from "@/lib/page-content"

export const metadata = { title: "Rentals — SYRA" }

const STEPS: [string, string, string][] = [
  ["01", "Browse + request", "Pick a piece and submit your dates with name, phone, email, and ID number. We don't take payment online."],
  ["02", "We confirm", "You'll get a callback or email within 1 working day to lock in dates and walk through the rental rules."],
  ["03", "Visit + collect", "Bring valid government ID and the refundable deposit (cash or bank transfer) to the atelier in Marampally. Leave with the piece."],
  ["04", "Wear + return", "Return on the agreed date. Deposit refunded in full within 5 working days of inspection."],
]

const FAQ: [string, string][] = [
  ["Why don't you take rental payment online?", "Bridal rentals are high-value pieces. We only release them against a verified government-issued ID and a deposit handed over in person — that protects both you and the atelier."],
  ["What's the security deposit for?", "It covers loss + damage. We refund it within 5 working days of return inspection. Deposit is paid in cash or bank transfer at the atelier — never online."],
  ["What ID do I bring?", "Emirates ID, passport, or UAE driving license. Originals only, not photos. We log the number and return the original immediately."],
  ["Can I rent for one day only?", "Some pieces yes — duration tabs on each product page show options. Most start at 3 days."],
  ["What if a stone falls out?", "Don't panic. Bring it back; if it's a clear setting failure we cover it. If it's wear-and-tear, we deduct from the deposit at retail value."],
  ["Do you ship rentals outside the UAE?", "Not yet — pickup or doorstep within the UAE only for now."],
]

export default async function RentalsPage() {
  const cms = await getPageContent("rentals")
  const products = await fetchProducts()
  const rentable = products.filter((p) => p.rental.enabled)

  return (
    <div className="overflow-x-hidden">
      {/* HERO */}
      <section className="relative border-b border-line px-4 py-28 md:px-12 md:py-44">
        <Sparkles count={36} />
        <div className="relative z-10 mx-auto max-w-[1100px]">
          <Reveal>
            <Eyebrow className="mb-4 block text-accent">Rentals · By appointment</Eyebrow>
            <p
              className="font-display tracking-tighter"
              style={{ fontSize: "clamp(56px, 8vw, 132px)", lineHeight: 0.95 }}
            >
              Wear it for the
              <br />
              <em className="text-accent">moment</em>.
            </p>
            <p className="mt-6 max-w-[560px] text-base leading-relaxed text-ink-2">
              Bridal sets and statement pieces, hand-finished and rented for ceremonies. We size, dispatch, and collect.
              {" "}
              <strong className="text-accent">{rentable.length} pieces</strong> currently available for rent.
            </p>
          </Reveal>
        </div>
      </section>

      {/* RENTABLE PIECES GRID */}
      <section className="border-b border-line px-4 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <Eyebrow className="block text-accent">Available for rent</Eyebrow>
              <p
                className="mt-3 font-display tracking-tighter"
                style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
              >
                Pick your <em className="text-accent">piece</em>.
              </p>
            </div>
          </div>

          {rentable.length === 0 ? (
            <div className="border border-line p-14 text-center">
              <p className="font-display text-3xl">
                <em>No pieces are rentable right now.</em>
              </p>
              <Eyebrow className="mt-2 block">Check back next Friday</Eyebrow>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
              {rentable.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}?mode=rent`}
                  className="group flex flex-col gap-3"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Placeholder image={p.image} className="h-full w-full" alt={p.name} />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-accent px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-paper">
                      ★ For rent
                    </span>
                  </div>
                  <div>
                    <Eyebrow className="block text-accent">{p.kind}</Eyebrow>
                    <div className="mt-1 flex items-baseline justify-between">
                      <p className="font-display text-xl tracking-tight transition-colors group-hover:text-accent">
                        {p.name}
                      </p>
                      <span className="font-mono text-[11px] text-muted">
                        from {priceFmt(p.rental.daily_rate)}/day
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                      Buy {priceFmt(p.price)} · Deposit {priceFmt(p.rental.security_deposit)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="grid gap-px border-b border-line bg-line md:grid-cols-4">
        {STEPS.map(([num, title, copy]) => (
          <div key={num} className="bg-bg p-10 md:p-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">{num}</span>
            <h3 className="mt-4 font-display text-3xl tracking-tight">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{copy}</p>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="border-b border-line px-4 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <Eyebrow className="mb-3 block text-accent">Things people ask</Eyebrow>
          <p
            className="font-display tracking-tighter"
            style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
          >
            Rental <em className="text-accent">FAQ</em>.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-px bg-line md:grid-cols-2">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group bg-bg p-6 transition-colors open:bg-bg-2 md:p-8">
                <summary className="cursor-pointer list-none font-display text-xl tracking-tight transition-colors group-hover:text-accent md:text-2xl">
                  {q}
                  <span className="float-right text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-ink-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center md:px-12 md:py-28">
        <Eyebrow className="mb-3 block text-accent">Need a custom rental?</Eyebrow>
        <p
          className="font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          We&apos;ll bring something <em className="text-accent">to the atelier</em>.
        </p>
        <Link
          href="/help/contact"
          className="mt-8 inline-block border border-line bg-bg px-7 py-3 font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent"
        >
          Email the studio →
        </Link>
      </section>
      {cms?.blocks && cms.blocks.length > 0 && (
        <PageBlocks blocks={cms.blocks} />
      )}
    </div>
  )
}
