"use client"
import Link from "next/link"
import { Eyebrow } from "../primitives/eyebrow"
import { Marquee } from "../motion/marquee"

export type FooterGroup = {
  title: string
  links: { href: string; label: string }[]
}

type FooterProps = {
  brand: string
  logoUrl?: string
  className?: string
  tagline: string
  marqueeItems: string[]
  /** Arbitrary number of link groups — driven by brand_config.footer_groups. */
  groups: FooterGroup[]
  newsletterCopy: string
  copyright: string
  /** Optional sub-headline under the tagline. Defaults to "<brand> — A Wearable Art Label". */
  subheadline?: string
}

export function Footer({
  brand,
  logoUrl,
  className,
  tagline,
  marqueeItems,
  groups,
  newsletterCopy,
  copyright,
  subheadline,
}: FooterProps) {
  // Two columns of link-groups + tagline column + newsletter — keeps the
  // 4-column rhythm even if footer_groups has only one or three entries.
  return (
    <footer className={`border-t border-line ${className ?? ""}`}>
      <Marquee
        items={marqueeItems}
        speed={50}
        className="border-b border-line py-5 font-display text-[28px] italic"
      />
      <div className="px-4 pb-8 pt-14 md:px-8 md:pt-16">
        <div className="mb-14 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={brand} className="marble-footer-logo" />
            )}
            <p className="font-display text-[44px] leading-[0.95] tracking-tight md:text-[56px]">
              {tagline.split("|").map((part, i) =>
                i % 2 === 0 ? (
                  <span key={i}>{part}</span>
                ) : (
                  <em key={i} className="not-italic font-display italic">
                    {part}
                  </em>
                ),
              )}
            </p>
            <Eyebrow className="mt-5 block">{subheadline ?? brand}</Eyebrow>
          </div>
          {groups.slice(0, 2).map((g) => (
            <div key={g.title}>
              <Eyebrow className="mb-4 block">{g.title}</Eyebrow>
              <div className="flex flex-col gap-2 text-[13px]">
                {g.links.map((l) => (
                  <Link key={l.href} href={l.href} className="ulink">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {/* Pad with empty columns if fewer than 2 groups so newsletter stays right-aligned */}
          {Array.from({ length: Math.max(0, 2 - groups.length) }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          <div>
            <Eyebrow className="mb-4 block">Newsletter</Eyebrow>
            <p className="mb-3 text-[13px] text-muted">{newsletterCopy}</p>
            <form className="flex border-b border-ink pb-1.5">
              <input
                type="email"
                placeholder="email@domain.com"
                className="flex-1 border-none bg-transparent text-[13px] outline-none placeholder:text-muted"
                required
              />
              <button type="submit" className="font-mono text-[11px] uppercase tracking-widest" aria-label="Subscribe">
                →
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-line pt-6 font-mono text-[11px] text-muted md:flex-row">
          <span>{copyright}</span>
          <span>PRIVACY · TERMS · COOKIES</span>
        </div>
      </div>
    </footer>
  )
}
