import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, Copy, Sparkles } from "lucide-react"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { priceFmt } from "@podium/ui/lib"
import { ProductCard } from "@/components/product/product-card"
import { OptimizedImage } from "@/components/media/optimized-image"
import { JsonLd } from "@/components/seo/json-ld"
import { fetchProducts } from "@/lib/medusa-products"
import { breadcrumbJsonLd, campaignJsonLd, collectionJsonLd } from "@/lib/seo-jsonld"
import { buildPageMetadata } from "@/lib/seo"
import { campaignTrackedHref, fetchCampaign, filterCampaignProducts } from "@/lib/campaigns"

/**
 * /campaigns/[slug]
 *
 * Campaign rows are stored in SiteContent with:
 * - page = "campaigns"
 * - section = public slug, e.g. "diwali-sale"
 * - metadata = JSON campaign settings such as coupon, dates, product filters and UTM values.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const campaign = await fetchCampaign(slug)
  if (!campaign) notFound()
  return buildPageMetadata({
    title: campaign.title,
    description: campaign.subtitle || campaign.body || "Shop this limited SYRA jewellery campaign.",
    path: `/campaigns/${campaign.slug}`,
    image: campaign.image,
    noIndex: campaign.metadata.noIndex,
  })
}

export default async function CampaignPage({ params }: { params: Params }) {
  const { slug } = await params
  const campaign = await fetchCampaign(slug)
  if (!campaign) notFound()

  const allProducts = await fetchProducts()
  const products = filterCampaignProducts(allProducts, campaign).slice(0, 12)
  const href = campaignTrackedHref(campaign)
  const secondaryHref = campaign.metadata.secondaryCtaHref ? campaignTrackedHref(campaign, campaign.metadata.secondaryCtaHref) : "/collection"
  const endsAt = campaign.metadata.endsAt ? new Date(campaign.metadata.endsAt) : null
  const startsAt = campaign.metadata.startsAt ? new Date(campaign.metadata.startsAt) : null

  return (
    <main className="overflow-x-hidden bg-bg text-ink">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: campaign.title, url: `/campaigns/${campaign.slug}` },
          ]),
          campaignJsonLd(campaign),
          collectionJsonLd(products, { name: campaign.title, url: `/campaigns/${campaign.slug}` }),
        ]}
      />

      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden border-b border-line px-4 py-16 md:px-12 md:py-24">
        <div className="absolute inset-0 opacity-55">
          <OptimizedImage src={campaign.image} alt={campaign.title} priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82),rgba(0,0,0,0.45),rgba(0,0,0,0.18))]" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-180px)] max-w-[1240px] flex-col justify-end">
          {campaign.metadata.announcement && (
            <div className="mb-5 inline-flex w-fit items-center gap-2 border border-white/20 bg-white/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
              <Sparkles size={13} /> {campaign.metadata.announcement}
            </div>
          )}
          <Eyebrow className="mb-4 block text-accent">SYRA Campaign</Eyebrow>
          <h1 className="max-w-[980px] font-display text-white" style={{ fontSize: "clamp(56px, 9vw, 140px)", lineHeight: 0.9 }}>
            {campaign.title}
          </h1>
          {(campaign.subtitle || campaign.body) && (
            <p className="mt-6 max-w-[620px] text-base leading-7 text-white/82 md:text-lg">
              {campaign.subtitle || campaign.body}
            </p>
          )}

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href={href}><Button size="lg">{campaign.linkText}</Button></Link>
            <Link href={secondaryHref} className="font-mono text-[11px] uppercase tracking-widest text-white/80 underline-offset-4 hover:text-white hover:underline">
              {campaign.metadata.secondaryCtaText || "Explore all jewellery"}
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {campaign.metadata.couponCode && (
              <InfoTile icon={<Copy size={15} />} label="Campaign code" value={campaign.metadata.couponCode} />
            )}
            {startsAt && <InfoTile icon={<Clock size={15} />} label="Starts" value={startsAt.toLocaleDateString("en-IN")} />}
            {endsAt && <InfoTile icon={<Clock size={15} />} label="Ends" value={endsAt.toLocaleDateString("en-IN")} />}
          </div>
        </div>
      </section>

      {campaign.body && campaign.subtitle && (
        <section className="border-b border-line px-4 py-14 md:px-12 md:py-20">
          <div className="mx-auto max-w-[860px] text-center">
            <Eyebrow className="mb-4 block text-accent">The edit</Eyebrow>
            <p className="font-display text-3xl leading-tight md:text-5xl">{campaign.body}</p>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="mx-auto max-w-[1480px] px-4 py-16 md:px-12 md:py-24">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Eyebrow className="mb-3 block text-accent">Campaign pieces</Eyebrow>
              <h2 className="font-display text-4xl tracking-tight md:text-6xl">Shop the selection</h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
              From {priceFmt(Math.min(...products.map((product) => product.price)))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
          </div>
        </section>
      )}

      {(campaign.metadata.couponCode || campaign.metadata.terms) && (
        <section className="border-t border-line bg-bg-2 px-4 py-10 md:px-12">
          <div className="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <Eyebrow className="mb-2 block text-accent">Offer details</Eyebrow>
              {campaign.metadata.couponCode && <p className="font-display text-3xl">Use {campaign.metadata.couponCode}</p>}
            </div>
            <p className="text-sm leading-6 text-muted">
              {campaign.metadata.terms || "Campaign valid while stocks last. Coupon eligibility and order minimums are controlled by the active coupon settings in admin."}
            </p>
          </div>
        </section>
      )}
    </main>
  )
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border border-white/15 bg-black/25 p-4 text-white backdrop-blur">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60">
        {icon} {label}
      </div>
      <p className="font-display text-2xl">{value}</p>
    </div>
  )
}
