import type { Product } from "@/lib/products"
import type { Campaign } from "@/lib/campaigns"
import { absoluteImage, absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo"

export function productJsonLd(product: Product) {
  const isOutOfStock = product.tags?.some((tag) => /out of stock|sold out/i.test(tag)) || /out of stock|sold out/i.test(product.tag ?? "")
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery.length > 0 ? product.gallery.map(absoluteImage) : [absoluteImage(product.image)],
    description: product.desc || product.caption,
    sku: product.id,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.kind,
    material: product.material ?? undefined,
    url: absoluteUrl(`/products/${product.id}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: absoluteUrl(`/products/${product.id}`),
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  }
}

export function productFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this anti-tarnish?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, SYRA pieces use an anti-tarnish coating designed for daily wear." },
      },
      {
        "@type": "Question",
        name: "Is it waterproof?",
        acceptedAnswer: { "@type": "Answer", text: "SYRA jewellery is water-resistant. Avoid prolonged swimming or harsh chemicals." },
      },
      {
        "@type": "Question",
        name: "What is the return policy?",
        acceptedAnswer: { "@type": "Answer", text: "Eligible pieces can be returned within the published return window." },
      },
    ],
  }
}

export function collectionJsonLd(products: Product[], options: { name?: string; url?: string } = {}) {
  const url = options.url ?? "/collection"
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name ?? "SYRA Collection",
    url: absoluteUrl(url),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/products/${product.id}`),
        name: product.name,
      })),
    },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

export function campaignJsonLd(campaign: Campaign) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: campaign.title,
    description: campaign.subtitle || campaign.body || undefined,
    url: absoluteUrl(`/campaigns/${campaign.slug}`),
    image: absoluteImage(campaign.image),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: campaign.metadata.couponCode
      ? {
          "@type": "Offer",
          name: campaign.metadata.couponLabel || `${campaign.metadata.couponCode} campaign offer`,
          url: absoluteUrl(`/campaigns/${campaign.slug}`),
          validFrom: campaign.metadata.startsAt || undefined,
          validThrough: campaign.metadata.endsAt || undefined,
          availability: "https://schema.org/InStock",
        }
      : undefined,
  }
}

export function articleJsonLd(post: {
  title: string
  slug: string
  excerpt?: string | null
  coverImage?: string | null
  author?: string | null
  publishedAt?: Date | string | null
  updatedAt?: Date | string | null
}) {
  const published = post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined
  const updated = post.updatedAt ? new Date(post.updatedAt).toISOString() : published
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? [absoluteImage(post.coverImage)] : [absoluteImage("/hero/syra_hero_1.png")],
    datePublished: published,
    dateModified: updated,
    author: { "@type": "Organization", name: post.author || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteImage("/hero/syra_hero_1.png") },
    },
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteImage("/hero/syra_hero_1.png"),
    description: "Anti-tarnish, waterproof fine-look jewellery made to be worn every day.",
    sameAs: ["https://instagram.com/syrathelabel"],
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}
