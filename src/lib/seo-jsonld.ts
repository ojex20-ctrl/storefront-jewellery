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
      price: product.price.toFixed(2),
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

function absUrl(path: string) {
  if (!path) return SITE_URL
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}
