// [MOCK] Backend disabled for UI-only development.
// Cart-to-Medusa bridge returns empty resolved items without hitting Medusa.

import type { CartLine } from "@/stores/cart-store"

export type ResolveResult = {
  items: { variantId: string; quantity: number }[]
  unresolved: CartLine[]
}

export async function resolveZioraCartLines(
  items: CartLine[],
): Promise<ResolveResult> {
  // [MOCK] Return all items as unresolved — checkout is UI-only
  return { items: [], unresolved: items }
}
