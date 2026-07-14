import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { CAMPAIGN_PAGE, normalizeCampaignSlug } from "@/lib/campaigns"
import { isValidCouponCode, isValidPlainText, isValidUrlOrPath } from "@/lib/validation"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const campaigns = await prisma.siteContent.findMany({
    where: { page: CAMPAIGN_PAGE },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  })
  return NextResponse.json({ campaigns })
}

export async function POST(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const payload = normalizePayload(body)
  const error = validatePayload(payload)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const campaign = await prisma.siteContent.create({ data: payload })
  return NextResponse.json({ campaign }, { status: 201 })
}

function validatePayload(payload: ReturnType<typeof normalizePayload>) {
  if (!payload.section || !isValidPlainText(payload.title, { required: true, max: 240 })) return "Slug and title are required"
  if (payload.subtitle && !isValidPlainText(payload.subtitle, { max: 500 })) return "Enter a valid subtitle."
  if (payload.body && !isValidPlainText(payload.body, { max: 8000 })) return "Enter valid body content."
  if (payload.image && !isValidUrlOrPath(payload.image)) return "Enter a valid campaign image URL or path."
  if (payload.link && !isValidUrlOrPath(payload.link)) return "Enter a valid campaign link."
  if (payload.linkText && !isValidPlainText(payload.linkText, { max: 160 })) return "Enter valid campaign link text."
  const metadata = JSON.parse(payload.metadata) as { couponCode?: string; secondaryCtaHref?: string; secondaryCtaText?: string; announcement?: string }
  if (metadata.couponCode && !isValidCouponCode(metadata.couponCode)) return "Enter a valid coupon code."
  if (metadata.secondaryCtaHref && !isValidUrlOrPath(metadata.secondaryCtaHref)) return "Enter a valid secondary CTA link."
  if (metadata.secondaryCtaText && !isValidPlainText(metadata.secondaryCtaText, { max: 160 })) return "Enter valid secondary CTA text."
  if (metadata.announcement && !isValidPlainText(metadata.announcement, { max: 500 })) return "Enter valid announcement text."
  return null
}

function normalizePayload(body: Record<string, unknown>) {
  const metadata = sanitizeMetadata(body.metadata, body)
  return {
    page: CAMPAIGN_PAGE,
    section: normalizeCampaignSlug(String(body.slug ?? body.section ?? "")),
    title: stringOrNull(body.title),
    subtitle: stringOrNull(body.subtitle),
    body: stringOrNull(body.body),
    image: stringOrNull(body.image),
    image2: null,
    link: stringOrNull(body.link) ?? "/collection",
    linkText: stringOrNull(body.linkText) ?? "Shop the campaign",
    metadata: JSON.stringify(metadata),
    published: Boolean(body.published),
    sortOrder: numberOrZero(body.sortOrder),
  }
}

function sanitizeMetadata(raw: unknown, body: Record<string, unknown>) {
  const value = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {}
  return {
    couponCode: stringOrEmpty(value.couponCode).toUpperCase(),
    couponLabel: stringOrEmpty(value.couponLabel),
    startsAt: stringOrEmpty(value.startsAt),
    endsAt: stringOrEmpty(value.endsAt),
    noIndex: Boolean(value.noIndex),
    terms: stringOrEmpty(value.terms),
    productKinds: stringArray(value.productKinds),
    productTags: stringArray(value.productTags),
    productSlugs: stringArray(value.productSlugs).map(normalizeCampaignSlug),
    secondaryCtaHref: stringOrEmpty(value.secondaryCtaHref),
    secondaryCtaText: stringOrEmpty(value.secondaryCtaText),
    announcement: stringOrEmpty(value.announcement),
    utmSource: stringOrEmpty(value.utmSource) || "syra",
    utmMedium: stringOrEmpty(value.utmMedium) || "campaign",
    utmCampaign: normalizeCampaignSlug(stringOrEmpty(value.utmCampaign) || stringOrEmpty(body.slug)),
  }
}

function stringOrNull(value: unknown) {
  const text = typeof value === "string" ? value.trim() : ""
  return text || null
}

function stringOrEmpty(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean)
  return []
}

function numberOrZero(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : 0
}
