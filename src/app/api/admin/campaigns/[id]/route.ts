import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { CAMPAIGN_PAGE, normalizeCampaignSlug } from "@/lib/campaigns"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const payload = normalizePayload(body)
  if (!payload.section || !payload.title) {
    return NextResponse.json({ error: "Slug and title are required" }, { status: 400 })
  }

  const campaign = await prisma.siteContent.update({
    where: { id },
    data: payload,
  })
  return NextResponse.json({ campaign })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await prisma.siteContent.delete({ where: { id } })
  return NextResponse.json({ ok: true })
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
