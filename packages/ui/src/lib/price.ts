/**
 * Currency-aware price formatter.
 *
 * Pricing flow end-to-end:
 *   1. Medusa stores one `price` row per (variant, currency_code). Admin
 *      manages it under Products → Variant → Prices in the dashboard.
 *   2. The storefront's fetcher reads the `currency` cookie (or the
 *      country-hint header / brand default) and pulls the matching
 *      `currency_code` price out of each variant. Cached by Next ISR
 *      for 60s but the variant rows in the cached payload include ALL
 *      currencies, so flipping the cookie picks a different price out
 *      of the same cached payload — no extra DB hit per switch.
 *   3. The layout calls `setActiveCurrencyForRender()` once per request
 *      so SSR `priceFmt(n)` calls render with the right symbol.
 *   4. On the client, `priceFmt` falls back to reading `document.cookie`
 *      so any priceFmt call after hydration keeps showing the right
 *      symbol even if a component re-renders.
 *
 * Resolution order in `priceFmt(n, override?)`:
 *   1. `override` arg (highest priority — explicit currency)
 *   2. Browser cookie (client only)
 *   3. Module-scoped active currency (server, set by layout)
 *   4. "inr" (India-first default)
 */

const SYMBOLS: Record<string, string> = {
  inr: "₹",
  aed: "AED ",
  usd: "$",
  gbp: "£",
  eur: "€",
  sar: "SAR ",
  jpy: "¥",
  cad: "$",
  aud: "$",
}

const COOKIE_NAME = "currency"

/**
 * Server-side hook for layouts: call this with the per-request resolved
 * currency code so subsequent `priceFmt` calls pick up the right symbol.
 *
 *   const currency = resolveCurrency(cookieJar, headerJar, brand.default_currency)
 *   setActiveCurrencyForRender(currency)
 *
 * We pin the value to `globalThis` rather than a module-scoped `let` so
 * every imported instance of this module (Next dev splits server / client
 * bundles into separate copies of @podium/ui/lib) sees the same value.
 */
const GLOBAL_KEY = "__podium_active_currency__"
export function setActiveCurrencyForRender(code: string | null | undefined) {
  ;(globalThis as Record<string, unknown>)[GLOBAL_KEY] = code
    ? code.toLowerCase()
    : null
}
function getActiveCurrencyForRender(): string | null {
  return (
    ((globalThis as Record<string, unknown>)[GLOBAL_KEY] as string | null) ?? null
  )
}

function readCookieCurrency(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)currency=([^;]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

function activeCurrencyCode(explicit?: string): string {
  if (explicit) return explicit.toLowerCase()
  if (typeof document !== "undefined") {
    const fromCookie = readCookieCurrency()
    if (fromCookie) return fromCookie.toLowerCase()
  }
  return getActiveCurrencyForRender() ?? "inr"
}

export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string,
): string {
  const code = activeCurrencyCode(currency).toUpperCase()
  const loc = locale ?? defaultLocale(code)
  try {
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${SYMBOLS[code.toLowerCase()] ?? code + " "}${Math.round(amount).toLocaleString()}`
  }
}

/** Backwards-compatible alias matching the prototype helper. */
export const priceFmt = (n: number, currency?: string): string => {
  const code = activeCurrencyCode(currency)
  const symbol = SYMBOLS[code] ?? code.toUpperCase() + " "
  return `${symbol}${Math.round(n).toLocaleString()}`
}

function defaultLocale(code: string): string {
  switch (code.toUpperCase()) {
    case "INR":
      return "en-IN"
    case "AED":
      return "en-AE"
    case "GBP":
      return "en-GB"
    case "EUR":
      return "en-IE"
    case "SAR":
      return "en-SA"
    default:
      return "en-US"
  }
}

// Suppress lint warning on unused literal — kept for future module-export use.
export { COOKIE_NAME as PRICE_COOKIE_NAME }
