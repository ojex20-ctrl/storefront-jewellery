// [MOCK] Backend disabled for UI-only development.
// Page content loader returns null without hitting Medusa.

import type { PageBlock } from "@podium/ui/chrome"

export type Page = {
  id: string
  brand: string
  slug: string
  title: string
  meta_description: string | null
  eyebrow: string | null
  blocks: PageBlock[] | null
  published: boolean
  metadata: Record<string, unknown> | null
}

// const HANDLE = process.env.NEXT_PUBLIC_BRAND_HANDLE ?? "jewellery"
// const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"

export async function getPageContent(_slug: string): Promise<Page | null> {
  // [MOCK] Return null — pages fall back to their static content
  return null
}
