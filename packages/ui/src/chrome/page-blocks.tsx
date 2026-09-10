"use client"
import * as React from "react"

/**
 * Shared renderer for the `page_content` admin module's `blocks` JSON shape.
 *
 * Every storefront uses the same block types (hero, text, image, split,
 * cta, faq, steps, quote) but each has its own typography + accent palette.
 * This component renders each block with token-driven classes (`bg`,
 * `accent`, `ink`, `line`, `muted`) so it picks up the storefront's CSS
 * variables automatically — drop it in and the brand colours apply.
 *
 * If a storefront wants a totally custom treatment for a specific block
 * type, pass `renderers={{ hero: MyHero }}` to override that one type
 * while keeping the defaults for the rest.
 */
export type PageBlock = {
  id: string
  type:
    | "hero"
    | "text"
    | "image"
    | "split"
    | "cta"
    | "faq"
    | "steps"
    | "quote"
    | "metric"
    | "timeline"
    | "testimonial"
    | "gallery"
    | "list"
  data: Record<string, unknown>
}

export type PageBlocksProps = {
  blocks: PageBlock[]
  /** Per-block-type overrides. */
  renderers?: Partial<Record<PageBlock["type"], (block: PageBlock) => React.ReactNode>>
  /** Wrapping section className applied around each block. */
  sectionClassName?: string
}

export function PageBlocks({ blocks, renderers, sectionClassName }: PageBlocksProps) {
  return (
    <>
      {blocks.map((b) => {
        const override = renderers?.[b.type]
        if (override) return <React.Fragment key={b.id}>{override(b)}</React.Fragment>
        return (
          <section
            key={b.id}
            className={
              sectionClassName ?? "border-b border-line px-4 py-16 md:px-8 md:py-24"
            }
          >
            <DefaultBlock block={b} />
          </section>
        )
      })}
    </>
  )
}

function DefaultBlock({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock data={block.data} />
    case "text":
      return <TextBlock data={block.data} />
    case "image":
      return <ImageBlock data={block.data} />
    case "split":
      return <SplitBlock data={block.data} />
    case "cta":
      return <CtaBlock data={block.data} />
    case "faq":
      return <FaqBlock data={block.data} />
    case "steps":
      return <StepsBlock data={block.data} />
    case "quote":
      return <QuoteBlock data={block.data} />
    case "metric":
      return <MetricBlock data={block.data} />
    case "timeline":
      return <TimelineBlock data={block.data} />
    case "testimonial":
      return <TestimonialBlock data={block.data} />
    case "gallery":
      return <GalleryBlock data={block.data} />
    case "list":
      return <ListBlock data={block.data} />
    default:
      return null
  }
}

function s(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function HeroBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="mx-auto max-w-[1100px]">
      {s(data.eyebrow) && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
          {s(data.eyebrow)}
        </span>
      )}
      <h1
        className="mt-3 font-display tracking-tighter"
        style={{ fontSize: "clamp(48px, 8vw, 120px)", lineHeight: 0.92, letterSpacing: "-0.025em" }}
      >
        {s(data.heading)}
      </h1>
      {s(data.body) && (
        <p className="mt-6 max-w-[640px] text-lg leading-relaxed text-ink-2">
          {s(data.body)}
        </p>
      )}
    </div>
  )
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const paras = s(data.body).split(/\n\s*\n/).filter(Boolean)
  return (
    <div className="mx-auto max-w-[760px]">
      {paras.map((p, i) => (
        <p key={i} className="mb-5 text-lg leading-relaxed text-ink-2 last:mb-0">
          {p}
        </p>
      ))}
    </div>
  )
}

function ImageBlock({ data }: { data: Record<string, unknown> }) {
  if (!s(data.src)) return null
  return (
    <div className="mx-auto max-w-[1280px]">
      <img
        src={s(data.src)}
        alt={s(data.alt)}
        className="w-full"
        loading="lazy"
      />
    </div>
  )
}

function SplitBlock({ data }: { data: Record<string, unknown> }) {
  const imageRight = s(data.image_side) === "right"
  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
      {!imageRight && s(data.image_src) && (
        <img
          src={s(data.image_src)}
          alt={s(data.image_alt)}
          className="aspect-[4/5] w-full object-cover"
          loading="lazy"
        />
      )}
      <div>
        {s(data.eyebrow) && (
          <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
            {s(data.eyebrow)}
          </span>
        )}
        <h2
          className="mt-3 font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          {s(data.heading)}
        </h2>
        {s(data.body) && (
          <p className="mt-5 text-base leading-relaxed text-ink-2">{s(data.body)}</p>
        )}
      </div>
      {imageRight && s(data.image_src) && (
        <img
          src={s(data.image_src)}
          alt={s(data.image_alt)}
          className="aspect-[4/5] w-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  )
}

function CtaBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="mx-auto max-w-[900px] text-center">
      <p
        className="font-display tracking-tighter"
        style={{ fontSize: "clamp(36px, 5vw, 72px)" }}
      >
        {s(data.heading)}
      </p>
      {s(data.href) && s(data.label) && (
        <a
          href={s(data.href)}
          className="mt-8 inline-block border border-line bg-bg px-7 py-3 font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent"
        >
          {s(data.label)}
        </a>
      )}
    </div>
  )
}

function FaqBlock({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ q: string; a: string }>) ?? []
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2">
        {items.map((it, i) => (
          <details
            key={i}
            className="group bg-bg p-6 transition-colors open:bg-bg-2 md:p-8"
          >
            <summary className="cursor-pointer list-none font-display text-xl tracking-tight transition-colors group-hover:text-accent md:text-2xl">
              {it.q}
              <span className="float-right text-accent transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-ink-2">{it.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

function StepsBlock({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<[string, string, string]>) ?? []
  return (
    <div className="mx-auto max-w-[1280px]">
      {s(data.eyebrow) && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
          {s(data.eyebrow)}
        </span>
      )}
      {s(data.heading) && (
        <h2
          className="mt-3 font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          {s(data.heading)}
        </h2>
      )}
      <div className="mt-12 grid gap-px bg-line md:grid-cols-4">
        {items.map(([num, title, copy]) => (
          <div key={`${num}-${title}`} className="bg-bg p-8 md:p-10">
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
              {num}
            </span>
            <h3 className="mt-3 font-display text-2xl tracking-tight md:text-3xl">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuoteBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <figure className="mx-auto max-w-[900px] text-center">
      <blockquote
        className="font-display tracking-tighter"
        style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.1 }}
      >
        “{s(data.body)}”
      </blockquote>
      {s(data.attribution) && (
        <figcaption className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted">
          {s(data.attribution)}
        </figcaption>
      )}
    </figure>
  )
}

/**
 * Metric grid — 3- or 4-up stat cards. Each item is { value, label, sub? }.
 *   data.eyebrow, data.heading, data.items[]
 */
function MetricBlock({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<{ value: string; label: string; sub?: string }>) ?? []
  if (items.length === 0) return null
  return (
    <div className="mx-auto max-w-[1280px]">
      {s(data.eyebrow) && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
          {s(data.eyebrow)}
        </span>
      )}
      {s(data.heading) && (
        <h2
          className="mt-3 font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          {s(data.heading)}
        </h2>
      )}
      <div
        className={`mt-10 grid gap-px bg-line md:grid-cols-${Math.min(items.length, 4)}`}
      >
        {items.map((it, i) => (
          <div key={i} className="bg-bg p-8">
            <p
              className="font-display tracking-tighter text-accent"
              style={{ fontSize: "clamp(36px, 4vw, 56px)" }}
            >
              {it.value}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted">
              {it.label}
            </p>
            {it.sub && <p className="mt-2 text-sm text-ink-2">{it.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Year-by-year timeline.
 *   data.eyebrow, data.heading, data.items[] = [year, body]
 */
function TimelineBlock({ data }: { data: Record<string, unknown> }) {
  const items = (data.items as Array<[string, string]>) ?? []
  if (items.length === 0) return null
  return (
    <div className="mx-auto max-w-[920px]">
      {s(data.eyebrow) && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
          {s(data.eyebrow)}
        </span>
      )}
      {s(data.heading) && (
        <h2
          className="mt-3 font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          {s(data.heading)}
        </h2>
      )}
      <ol className="mt-10 border-l border-accent/40">
        {items.map(([year, body], i) => (
          <li key={i} className="relative pl-6 pb-8 last:pb-0">
            <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
              {year}
            </p>
            <p className="mt-2 text-base leading-relaxed text-ink-2">{body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Testimonial / pull-card grid.
 *   data.eyebrow, data.heading, data.items[] = { quote, author, role? }
 */
function TestimonialBlock({ data }: { data: Record<string, unknown> }) {
  const items =
    (data.items as Array<{ quote: string; author: string; role?: string }>) ?? []
  if (items.length === 0) return null
  return (
    <div className="mx-auto max-w-[1280px]">
      {s(data.eyebrow) && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
          {s(data.eyebrow)}
        </span>
      )}
      {s(data.heading) && (
        <h2
          className="mt-3 font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          {s(data.heading)}
        </h2>
      )}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <figure
            key={i}
            className="border border-line bg-bg p-6 transition-colors hover:border-accent"
          >
            <blockquote className="text-base leading-relaxed text-ink-2">
              "{it.quote}"
            </blockquote>
            <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-widest">
              <span className="text-ink-2">{it.author}</span>
              {it.role && <span className="text-muted"> · {it.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

/**
 * Image gallery — dense grid with optional captions.
 *   data.eyebrow, data.heading, data.items[] = { src, alt, caption? }
 */
function GalleryBlock({ data }: { data: Record<string, unknown> }) {
  const items =
    (data.items as Array<{ src: string; alt?: string; caption?: string }>) ?? []
  if (items.length === 0) return null
  return (
    <div className="mx-auto max-w-[1280px]">
      {s(data.eyebrow) && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
          {s(data.eyebrow)}
        </span>
      )}
      {s(data.heading) && (
        <h2
          className="mt-3 font-display tracking-tighter"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          {s(data.heading)}
        </h2>
      )}
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((it, i) => (
          <figure key={i}>
            <img
              src={it.src}
              alt={it.alt ?? ""}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
            {it.caption && (
              <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                {it.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}

/**
 * Plain bulleted / numbered list. For one-column "what's included" boxes.
 *   data.eyebrow, data.heading, data.style = "bullet" | "numbered" | "check"
 *   data.items[] = string or { label, body? }
 */
function ListBlock({ data }: { data: Record<string, unknown> }) {
  const itemsRaw = (data.items as Array<unknown>) ?? []
  const style = (data.style as string) ?? "bullet"
  if (itemsRaw.length === 0) return null
  const items = itemsRaw.map((it) =>
    typeof it === "string"
      ? { label: it, body: undefined as string | undefined }
      : (it as { label: string; body?: string }),
  )
  return (
    <div className="mx-auto max-w-[820px]">
      {s(data.eyebrow) && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
          {s(data.eyebrow)}
        </span>
      )}
      {s(data.heading) && (
        <h2
          className="mt-3 font-display tracking-tighter"
          style={{ fontSize: "clamp(28px, 4vw, 48px)" }}
        >
          {s(data.heading)}
        </h2>
      )}
      <ol className="mt-6 flex flex-col gap-3">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex gap-3 border-l-2 border-accent pl-4"
          >
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
              {style === "numbered"
                ? String(i + 1).padStart(2, "0")
                : style === "check"
                ? "✓"
                : "·"}
            </span>
            <div>
              <p className="text-base text-ink-2">{it.label}</p>
              {it.body && (
                <p className="mt-1 text-sm text-muted">{it.body}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
