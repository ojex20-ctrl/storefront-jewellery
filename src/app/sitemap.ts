import type { MetadataRoute } from "next"
import { fetchProducts } from "@/lib/medusa-products"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await fetchProducts()
  const now = new Date()
  const staticRoutes = [
    "",
    "/collection",
    "/search",
    "/about",
    "/contact",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/warranty",
    "/care-guide",
    "/size-guide",
    "/journal",
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
      changeFrequency: route === "" || route === "/collection" ? "daily" as const : "monthly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
