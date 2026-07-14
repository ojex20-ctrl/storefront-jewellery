import type { Metadata } from "next"

export const SITE_NAME = "SYRA"
export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? "https://syrathelabel.com")
export const DEFAULT_SEO_TITLE = "SYRA - Anti-Tarnish Jewellery"
export const DEFAULT_SEO_DESCRIPTION =
  "Shop SYRA anti-tarnish jewellery made for everyday wear. Waterproof, hypoallergenic rings, earrings, necklaces and bracelets with a premium finish."
export const DEFAULT_OG_IMAGE = "/hero/syra_hero_1.png"

export const SEO_KEYWORDS = [
  "SYRA",
  "SYRA The Label",
  "anti-tarnish jewellery",
  "waterproof jewellery",
  "hypoallergenic jewellery",
  "rings",
  "earrings",
  "necklaces",
  "bracelets",
  "jewellery India",
]

export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
} satisfies Metadata["robots"]

export const NO_INDEX_FOLLOW_ROBOTS = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
} satisfies Metadata["robots"]

export const PRIVATE_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
} satisfies Metadata["robots"]

type PageMetadataInput = {
  title: string
  description: string
  path: string
  image?: string | null
  noIndex?: boolean
  noFollow?: boolean
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(input.path)
  const image = absoluteImage(input.image)
  const robots = input.noIndex
    ? input.noFollow
      ? PRIVATE_ROBOTS
      : NO_INDEX_FOLLOW_ROBOTS
    : INDEXABLE_ROBOTS

  return {
    title: input.title,
    description: trimDescription(input.description),
    keywords: SEO_KEYWORDS,
    alternates: { canonical },
    robots,
    openGraph: {
      title: input.title,
      description: trimDescription(input.description),
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: trimDescription(input.description),
      images: [image],
    },
  }
}

export function privatePageMetadata(title: string): Metadata {
  return { title, robots: PRIVATE_ROBOTS }
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

export function absoluteImage(path?: string | null) {
  if (!path) return absoluteUrl(DEFAULT_OG_IMAGE)
  if (/^https?:\/\//i.test(path)) return path
  return absoluteUrl(path)
}

export function trimDescription(value: string, max = 158) {
  const text = value.replace(/\s+/g, " ").trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).replace(/[\s,.;:-]+$/g, "")}...`
}

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "")
  return trimmed || "https://syrathelabel.com"
}
