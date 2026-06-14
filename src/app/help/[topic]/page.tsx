import { notFound } from "next/navigation"
import Link from "next/link"
import { Reveal, WordReveal } from "@podium/ui/motion"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { PageBlocks } from "@podium/ui/chrome"
import { getPageContent } from "@/lib/page-content"
import { getBrandConfig } from "@/lib/brand-config"

/**
 * /help/[topic] is fully dynamic — we look up `page_content` with slug
 * `help-<topic>` and render whatever the admin set up at /app/page-editor.
 *
 * The "contact" topic is special: its shop info card is automatically
 * populated from brand_config (shop_address / phone / email / hours /
 * whatsapp), so admins set those once and every contact page picks them up.
 *
 * If neither a page_content row nor a built-in fallback exists, we 404.
 */

type FallbackEntry = {
  eyebrow: string
  title: string
  intro: string
  rows: { label: string; value: string }[]
  cta?: { href: string; label: string }
}

// Built-in fallbacks for topics that haven't been seeded into page_content
// yet. Drop these as you populate the corresponding rows in /app/page-editor.
function buildFallback(
  currency: string,
  threshold: number,
): Record<string, FallbackEntry> {
  return {
  shipping: {
    eyebrow: "Shipping",
    title: "Tracked, _GCC_.",
    intro: "Pieces ship insured from the atelier in Marampally. UAE-only doorstep for now.",
    rows: [
      { label: "GCC standard", value: `Free over ${currency} ${threshold} · 2–4 days` },
      { label: "GCC express", value: `${currency} 50 · 24h same emirate` },
      { label: "Pickup", value: "Free · Marampally atelier" },
    ],
  },
  sizing: {
    eyebrow: "Ring sizing",
    title: "Free _resizing_.",
    intro: "Owned pieces get free resizing for life. Send the piece back and we'll resize within 5 working days.",
    rows: [
      { label: "Standard", value: "Sizes 5–10 stocked" },
      { label: "Custom", value: "+1 week, no charge" },
      { label: "Lifetime resize", value: "On any owned piece" },
    ],
  },
  care: {
    eyebrow: "Care",
    title: "Soft cloth, _no chemicals_.",
    intro: "Wipe with the included microfibre after wear. Avoid pools, perfume, and ultrasonic cleaners.",
    rows: [
      { label: "Daily", value: "Microfibre wipe" },
      { label: "Monthly", value: "Warm soapy water rinse" },
      { label: "Avoid", value: "Pool, gym, perfume direct" },
    ],
  },
  rentals: {
    eyebrow: "How rentals work",
    title: "By _request_, in person.",
    intro: "We don't take rental payments online. Submit a request, we contact you, you bring ID + deposit to the atelier.",
    rows: [
      { label: "Lead time", value: "1–6 months ahead" },
      { label: "Deposit", value: "Cash or transfer at pickup" },
      { label: "ID required", value: "Emirates ID / passport / UAE license" },
    ],
    cta: { href: "/rentals", label: "See rentable pieces" },
  },
  }
}

const FALLBACK_TITLES: Record<string, string> = {
  shipping: "Shipping",
  sizing: "Ring sizing",
  care: "Care",
  rentals: "How rentals work",
}

const KNOWN_TOPICS = [
  "shipping",
  "returns",
  "sizing",
  "care",
  "rentals",
  "notes",
  "contact",
]

export async function generateMetadata({
  params,
}: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const cms = await getPageContent(`help-${topic}`)
  if (cms) return { title: cms.title }
  return { title: FALLBACK_TITLES[topic] ?? "Help" }
}

export default async function HelpTopicPage({
  params,
}: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const [cms, brand] = await Promise.all([
    getPageContent(`help-${topic}`),
    getBrandConfig(),
  ])
  const fallback = buildFallback(
    brand.default_currency,
    brand.free_shipping_threshold,
  )
  const fb = fallback[topic]
  if (!cms && !fb) notFound()
  const showContactCard = topic === "contact"

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-24 md:px-8 md:py-28">
      <Eyebrow className="mb-3.5 block">{cms?.eyebrow ?? fb?.eyebrow ?? topic}</Eyebrow>
      <WordReveal
        text={cms?.title ?? fb?.title ?? topic}
        className="mb-10 font-display"
        style={{ fontSize: "clamp(48px, 8vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.025em" }}
      />

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[2fr_1fr]">
        <div>
          {cms?.meta_description && (
            <p className="max-w-[640px] text-[15px] leading-relaxed text-ink-2">
              {cms.meta_description}
            </p>
          )}
          {!cms && fb?.intro && (
            <p className="max-w-[640px] text-[15px] leading-relaxed text-ink-2">{fb.intro}</p>
          )}
          <div className="mt-10 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest">
            {KNOWN_TOPICS.map((t) => (
              <Link
                key={t}
                href={`/help/${t}`}
                className={`border px-3 py-1.5 transition-colors ${
                  t === topic
                    ? "border-ink bg-ink text-bg"
                    : "border-line text-muted hover:border-ink hover:text-ink"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact card — always shows when topic=contact, pulls from brand_config */}
        {showContactCard && (
          <Reveal>
            <div className="border border-line p-6">
              <Eyebrow className="mb-4 block">Reach the studio</Eyebrow>
              <ul className="flex flex-col">
                {brand.shop_email && (
                  <ContactRow label="Email" value={brand.shop_email} href={`mailto:${brand.shop_email}`} />
                )}
                {brand.shop_phone && (
                  <ContactRow label="Phone" value={brand.shop_phone} href={`tel:${brand.shop_phone.replace(/\s/g, "")}`} />
                )}
                {brand.shop_whatsapp && (
                  <ContactRow label="WhatsApp" value="Open chat →" href={brand.shop_whatsapp} />
                )}
                {brand.shop_address && (
                  <ContactRow label="Studio" value={brand.shop_address} />
                )}
                {brand.shop_hours && (
                  <ContactRow label="Hours" value={brand.shop_hours} />
                )}
              </ul>
              {brand.shop_map_url && (
                <div className="mt-6">
                  <Link href={brand.shop_map_url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm">
                      Open in maps →
                    </Button>
                  </Link>
                </div>
              )}
              {!brand.shop_email && !brand.shop_phone && !brand.shop_address && (
                <p className="text-xs text-muted">
                  Set shop info at /app/brand-config → Shop info.
                </p>
              )}
            </div>
          </Reveal>
        )}

        {/* Non-contact built-in "at a glance" card */}
        {!showContactCard && fb?.rows && (
          <Reveal>
            <div className="border border-line p-6">
              <Eyebrow className="mb-4 block">At a glance</Eyebrow>
              <ul className="flex flex-col">
                {fb.rows.map((r) => (
                  <ContactRow key={r.label} label={r.label} value={r.value} />
                ))}
              </ul>
              {fb.cta && (
                <div className="mt-6">
                  <Link href={fb.cta.href}>
                    <Button variant="ghost" size="sm">
                      {fb.cta.label} →
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>

      {/* Admin-editable blocks — render below the topic header */}
      {cms?.blocks && cms.blocks.length > 0 && (
        <div className="mt-16">
          <PageBlocks blocks={cms.blocks} />
        </div>
      )}
    </div>
  )
}

function ContactRow({
  label,
  value,
  href,
}: {
  label: string
  value: string
  href?: string
}) {
  return (
    <li className="flex justify-between gap-4 border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-sm">{label}</span>
      {href ? (
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          className="text-right font-mono text-[11px] text-muted hover:text-accent"
        >
          {value}
        </a>
      ) : (
        <span className="text-right font-mono text-[11px] text-muted whitespace-pre-line">{value}</span>
      )}
    </li>
  )
}
