import type { MetadataRoute } from "next"
import { fetchProducts } from "@/lib/medusa-products"
import { prisma } from "@/lib/db"
import { absoluteUrl } from "@/lib/seo"
import { fetchCampaigns } from "@/lib/campaigns"

export const dynamic = "force-dynamic"
export const revalidate = 0

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/collection", priority: 0.9, changeFrequency: "daily" },
  { path: "/collection/rings", priority: 0.85, changeFrequency: "daily" },
  { path: "/collection/earrings", priority: 0.85, changeFrequency: "daily" },
  { path: "/collection/necklaces", priority: 0.85, changeFrequency: "daily" },
  { path: "/collection/bracelets", priority: 0.85, changeFrequency: "daily" },
  { path: "/collection/best-sellers", priority: 0.8, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/shipping", priority: 0.55, changeFrequency: "monthly" },
  { path: "/returns", priority: 0.55, changeFrequency: "monthly" },
  { path: "/warranty", priority: 0.6, changeFrequency: "monthly" },
  { path: "/care-guide", priority: 0.6, changeFrequency: "monthly" },
  { path: "/size-guide", priority: 0.55, changeFrequency: "monthly" },
  { path: "/atelier", priority: 0.55, changeFrequency: "monthly" },
  { path: "/bespoke", priority: 0.55, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.5, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const products = await fetchProducts()
  const [posts, campaigns] = await Promise.all([fetchPublishedPosts(), fetchCampaigns()])

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.id}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/journal/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
    ...campaigns.map((campaign) => ({
      url: absoluteUrl(`/campaigns/${campaign.slug}`),
      lastModified: campaign.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ]
}

async function fetchPublishedPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, publishedAt: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    })
  } catch {
    return []
  }
}
