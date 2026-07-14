import "server-only"
import type { SiteContent } from "@prisma/client"
import { prisma } from "@/lib/db"
import type { Product } from "@/lib/products"

export const CAMPAIGN_PAGE = "campaigns"

export type CampaignMetadata = {
  couponCode?: string
  couponLabel?: string
  startsAt?: string
  endsAt?: string
  noIndex?: boolean
  terms?: string
  productKinds?: string[]
  productTags?: string[]
  productSlugs?: string[]
  secondaryCtaHref?: string
  secondaryCtaText?: string
  announcement?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export type Campaign = {
  id: string
  slug: string
  title: string
  subtitle: string
  body: string
  image: string
  link: string
  linkText: string
  published: boolean
  sortOrder: number
  updatedAt: Date
  metadata: CampaignMetadata
}

export function normalizeCampaignSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export async function fetchCampaign(slug: string, options: { includeInactive?: boolean } = {}) {
  const normalized = normalizeCampaignSlug(slug)
  if (!normalized) return null
  const row = await prisma.siteContent.findFirst({
    where: { page: CAMPAIGN_PAGE, section: normalized, ...(options.includeInactive ? {} : { published: true }) },
  })
  if (!row) return null
  const campaign = siteContentToCampaign(row)
  if (!options.includeInactive && !isCampaignLive(campaign)) return null
  return campaign
}

export async function fetchCampaigns(options: { includeInactive?: boolean } = {}) {
  const rows = await prisma.siteContent.findMany({
    where: { page: CAMPAIGN_PAGE, ...(options.includeInactive ? {} : { published: true }) },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  })
  const campaigns = rows.map(siteContentToCampaign)
  return options.includeInactive ? campaigns : campaigns.filter((campaign) => isCampaignLive(campaign))
}

export function siteContentToCampaign(row: SiteContent): Campaign {
  const metadata = parseCampaignMetadata(row.metadata)
  return {
    id: row.id,
    slug: row.section,
    title: row.title || titleFromSlug(row.section),
    subtitle: row.subtitle || "",
    body: row.body || "",
    image: row.image || "/hero/syra_hero_1.png",
    link: row.link || "/collection",
    linkText: row.linkText || "Shop the campaign",
    published: row.published,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt,
    metadata,
  }
}

export function parseCampaignMetadata(raw?: string | null): CampaignMetadata {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    const value = parsed as Record<string, unknown>
    return {
      couponCode: readString(value.couponCode)?.toUpperCase(),
      couponLabel: readString(value.couponLabel),
      startsAt: readString(value.startsAt),
      endsAt: readString(value.endsAt),
      noIndex: Boolean(value.noIndex),
      terms: readString(value.terms),
      productKinds: readStringArray(value.productKinds),
      productTags: readStringArray(value.productTags),
      productSlugs: readStringArray(value.productSlugs).map(normalizeCampaignSlug),
      secondaryCtaHref: readString(value.secondaryCtaHref),
      secondaryCtaText: readString(value.secondaryCtaText),
      announcement: readString(value.announcement),
      utmSource: readString(value.utmSource),
      utmMedium: readString(value.utmMedium),
      utmCampaign: readString(value.utmCampaign),
    }
  } catch {
    return {}
  }
}

export function isCampaignLive(campaign: Campaign, now = new Date()) {
  if (!campaign.published) return false
  const startsAt = parseDate(campaign.metadata.startsAt)
  const endsAt = parseDate(campaign.metadata.endsAt)
  if (startsAt && startsAt > now) return false
  if (endsAt && endsAt < now) return false
  return true
}

export function campaignStatus(campaign: Campaign, now = new Date()) {
  if (!campaign.published) return "draft"
  const startsAt = parseDate(campaign.metadata.startsAt)
  const endsAt = parseDate(campaign.metadata.endsAt)
  if (startsAt && startsAt > now) return "scheduled"
  if (endsAt && endsAt < now) return "ended"
  return "live"
}

export function campaignTrackedHref(campaign: Campaign, href = campaign.link) {
  if (!href) return "/collection"
  const isAbsolute = /^https?:\/\//i.test(href)
  const base = isAbsolute ? undefined : "https://syrathelabel.com"
  try {
    const url = new URL(href, base)
    url.searchParams.set("utm_source", campaign.metadata.utmSource || "syra")
    url.searchParams.set("utm_medium", campaign.metadata.utmMedium || "campaign")
    url.searchParams.set("utm_campaign", campaign.metadata.utmCampaign || campaign.slug)
    if (campaign.metadata.couponCode) url.searchParams.set("coupon", campaign.metadata.couponCode)
    return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`
  } catch {
    return href
  }
}

export function filterCampaignProducts(products: Product[], campaign: Campaign) {
  const slugs = new Set(campaign.metadata.productSlugs ?? [])
  const kinds = new Set((campaign.metadata.productKinds ?? []).map((value) => value.toLowerCase()))
  const tags = new Set((campaign.metadata.productTags ?? []).map((value) => value.toLowerCase()))

  if (slugs.size === 0 && kinds.size === 0 && tags.size === 0) return products.slice(0, 8)

  return products.filter((product) => {
    if (slugs.has(product.id)) return true
    if (kinds.has(product.kind.toLowerCase())) return true
    const productTags = [product.tag, ...(product.tags ?? [])].filter(Boolean).map((value) => String(value).toLowerCase())
    return productTags.some((tag) => tags.has(tag))
  })
}

function titleFromSlug(slug: string) {
  return slug.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Campaign"
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function readStringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean)
  return []
}

function parseDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
