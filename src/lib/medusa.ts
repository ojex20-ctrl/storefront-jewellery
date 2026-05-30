import Medusa from "@medusajs/js-sdk"

/**
 * Single Medusa SDK instance for the clothing storefront.
 *
 * The publishable key SCOPES every store-API call to ZIORA's sales
 * channel — products only show up if they're published to that channel.
 * To stand up the perfumes/jewellery/watches storefronts later, point each
 * `apps/storefront-*` at its own publishable key from the seed output.
 */
export const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
  debug: process.env.NODE_ENV === "development",
})
