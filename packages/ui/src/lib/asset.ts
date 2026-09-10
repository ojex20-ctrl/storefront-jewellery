/**
 * Asset URL resolver.
 *
 * Every storefront keeps its catalogue paths as if they were served locally
 * (`/products/m1.jpg`, `/models/p1.glb`). At render time we rewrite each
 * path to the Hetzner Object Storage URL using a three-layer prefix:
 *
 *   <PUBLIC_URL>/<ENV_FOLDER>/<BRAND_FOLDER>/<rel-path>
 *
 *   /products/m1.jpg   →  https://ecomm.hel1.your-objectstorage.com
 *                         /development/clothing/products/m1.jpg
 *
 * - `NEXT_PUBLIC_S3_PUBLIC_URL`  — bucket origin (no folder).
 * - `NEXT_PUBLIC_S3_ENV_FOLDER`  — `development` | `production`. Single switch.
 * - `NEXT_PUBLIC_S3_BRAND_FOLDER` — per-storefront slug, so each store has
 *    isolated assets (`clothing`, `perfumes`, `jewellery`, `watches`).
 *
 * If `NEXT_PUBLIC_S3_PUBLIC_URL` is empty we fall back to the local
 * Next.js `public/` folder — that means dev still works without the bucket.
 *
 * Already-absolute URLs (`http://`, `https://`, `data:`, `blob:`) pass
 * through unchanged.
 */

const PUBLIC_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_S3_PUBLIC_URL) || ""
const ENV_FOLDER =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_S3_ENV_FOLDER) ||
  "development"
const BRAND_FOLDER =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_S3_BRAND_FOLDER) || ""

export function assetUrl(path: string | undefined | null): string {
  if (!path) return ""
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  if (!PUBLIC_URL) return path
  const clean = path.replace(/^\/+/, "")
  const segments = [PUBLIC_URL.replace(/\/+$/, ""), ENV_FOLDER]
  if (BRAND_FOLDER) segments.push(BRAND_FOLDER)
  segments.push(clean)
  return segments.join("/")
}

/** True when storefront is configured to serve assets from object storage. */
export function isAssetCdnEnabled(): boolean {
  return Boolean(PUBLIC_URL)
}
