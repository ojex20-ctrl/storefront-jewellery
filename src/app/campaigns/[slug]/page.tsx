import { notFound } from "next/navigation"
import { PageBlocks } from "@podium/ui/chrome"
import { getPageContent } from "@/lib/page-content"

/**
 * /campaigns/[slug] — admin-driven campaign landing pages.
 *
 * Looks up `page_content` with slug `campaign-<slug>` and renders it via
 * PageBlocks. Admins create + edit at /app/page-editor — no code change
 * needed to launch a Diwali sale, EOSS, drop teaser, etc.
 *
 * If no row exists for the slug, we 404. The eyebrow + title + meta
 * description live in the page_content row alongside the blocks.
 */
type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const cms = await getPageContent(`campaign-${slug}`)
  if (!cms) return { title: "Campaign" }
  return {
    title: cms.title,
    description: cms.meta_description ?? undefined,
  }
}

export default async function CampaignPage({ params }: { params: Params }) {
  const { slug } = await params
  const cms = await getPageContent(`campaign-${slug}`)
  if (!cms) notFound()

  return (
    <div>
      {/* HERO */}
      <section className="border-b border-line px-4 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          {cms.eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">
              {cms.eyebrow}
            </span>
          )}
          <h1
            className="mt-3 font-display tracking-tighter"
            style={{ fontSize: "clamp(48px, 8vw, 120px)", lineHeight: 0.92, letterSpacing: "-0.025em" }}
          >
            {cms.title}
          </h1>
          {cms.meta_description && (
            <p className="mt-6 max-w-[640px] text-lg leading-relaxed text-ink-2">
              {cms.meta_description}
            </p>
          )}
        </div>
      </section>

      {/* BLOCKS */}
      {cms.blocks && cms.blocks.length > 0 && <PageBlocks blocks={cms.blocks} />}
    </div>
  )
}
