import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { CampaignsClient } from "./campaigns-client"
import { CAMPAIGN_PAGE, parseCampaignMetadata } from "@/lib/campaigns"

export default async function AdminCampaignsPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const [rows, products, coupons] = await Promise.all([
    prisma.siteContent.findMany({ where: { page: CAMPAIGN_PAGE }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
    prisma.product.findMany({ where: { published: true }, select: { slug: true, name: true, kind: true, tag: true }, orderBy: { sortOrder: "asc" } }),
    prisma.coupon.findMany({ where: { active: true }, select: { code: true }, orderBy: { createdAt: "desc" } }),
  ])

  const campaigns = rows.map((row) => ({
    id: row.id,
    slug: row.section,
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    body: row.body ?? "",
    image: row.image ?? "",
    link: row.link ?? "/collection",
    linkText: row.linkText ?? "Shop the campaign",
    published: row.published,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
    metadata: parseCampaignMetadata(row.metadata),
  }))

  return (
    <CampaignsClient
      campaigns={campaigns}
      products={products}
      coupons={coupons.map((coupon) => coupon.code)}
      user={session}
    />
  )
}
