import type { Product } from "@/lib/products"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"

export function productJsonLd(product: Product) {
  const isOutOfStock = product.tags?.some((tag) => /out of stock|sold out/i.test(tag)) || /out of stock|sold out/i.test(product.tag ?? "")
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery.length > 0 ? product.gallery.map(absUrl) : [absUrl(product.image)],
    description: product.desc || product.caption,
    sku: product.id,
    brand: { "@type": "Brand", name: "SYRA" },
    category: product.kind,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2), // stored in paise
      availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.id}`,
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

export function collectionJsonLd(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SYRA Collection",
    url: `${SITE_URL}/collection`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/products/${product.id}`,
        name: product.name,
      })),
    },
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SYRA",
    url: SITE_URL,
    logo: `${SITE_URL}/hero/syra_hero_1.png`,
    description: "Anti-tarnish, waterproof fine-look jewellery made to be worn every day.",
    sameAs: ["https://instagram.com/syrajewellery"],
  }
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SYRA",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

function absUrl(path: string) {
  if (!path) return SITE_URL
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
