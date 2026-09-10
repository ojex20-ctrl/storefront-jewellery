/**
 * Currency selection — cookie-driven, with IP-country fallback.
 *
 * Used by the storefront server-side fetchers + the CurrencyPicker UI.
 * The flow:
 *
 *   1. Server-side render reads `cookies().get("currency")?.value`.
 *   2. If none, looks at country-hint headers (Cloudflare's
 *      `cf-ipcountry`, Vercel's `x-vercel-ip-country`, generic
 *      `x-country`) and maps the country code → currency.
 *   3. Else falls back to the brand's `default_currency`.
 *
 *   The CurrencyPicker component sets the cookie on selection and
 *   reloads the page so server-rendered prices come back in the new
 *   currency.
 *
 * The supported list is small on purpose — every entry has to have a
 * matching Medusa region with prices, otherwise the storefront falls
 * back to the brand default. Add a row + region + variant prices to
 * extend.
 */

export type Currency = {
  /** ISO 4217 lowercase ("inr") — matches Medusa's currency_code. */
  code: string
  /** Display label (uppercase + symbol). */
  label: string
  symbol: string
  /** Country flag emoji used in the picker. */
  flag: string
  /** Locale used for `Intl.NumberFormat` formatting. */
  locale: string
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "inr", label: "INR", symbol: "₹", flag: "🇮🇳", locale: "en-IN" },
  { code: "aed", label: "AED", symbol: "AED ", flag: "🇦🇪", locale: "en-AE" },
  { code: "usd", label: "USD", symbol: "$", flag: "🇺🇸", locale: "en-US" },
  { code: "gbp", label: "GBP", symbol: "£", flag: "🇬🇧", locale: "en-GB" },
  { code: "eur", label: "EUR", symbol: "€", flag: "🇪🇺", locale: "en-IE" },
  { code: "sar", label: "SAR", symbol: "SAR ", flag: "🇸🇦", locale: "en-SA" },
]

const DEFAULT: Currency = SUPPORTED_CURRENCIES[0]!

/** Country-code → preferred currency code. Drives the IP fallback. */
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  IN: "inr",
  AE: "aed",
  SA: "sar",
  US: "usd",
  CA: "usd",
  GB: "gbp",
  IE: "eur",
  DE: "eur",
  FR: "eur",
  ES: "eur",
  IT: "eur",
  NL: "eur",
  BE: "eur",
  PT: "eur",
  AT: "eur",
}

/** Map an ISO-2 country to a currency code; null if not recognised. */
export function currencyForCountry(country: string | undefined | null): string | null {
  if (!country) return null
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? null
}

/** Look up the metadata for a given currency code (case-insensitive). */
export function getCurrency(code: string | null | undefined): Currency {
  if (!code) return DEFAULT
  const lower = code.toLowerCase()
  return SUPPORTED_CURRENCIES.find((c) => c.code === lower) ?? DEFAULT
}

/**
 * Format a currency-amount according to the active currency. Designed to
 * replace the existing storefront `priceFmt` helper — same call-site
 * shape, just takes the currency code as an optional second arg.
 */
export function priceFmtFor(amount: number, code?: string): string {
  const c = getCurrency(code)
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${c.symbol}${Math.round(amount).toLocaleString()}`
  }
}

/** Cookie name the picker writes to + the server reads. */
export const CURRENCY_COOKIE = "currency"

/**
 * Server-side resolver — pass the cookie value + (optional) country hint
 * read from request headers. Returns the currency code to use.
 *
 *   const c = resolveCurrency(
 *     cookies().get(CURRENCY_COOKIE)?.value,
 *     headers().get("cf-ipcountry") ?? headers().get("x-vercel-ip-country"),
 *     brand.default_currency,
 *   )
 */
export function resolveCurrency(
  cookieValue: string | undefined | null,
  countryHeader: string | undefined | null,
  brandDefault: string | undefined | null,
): string {
  if (cookieValue) {
    const lower = cookieValue.toLowerCase()
    if (SUPPORTED_CURRENCIES.some((c) => c.code === lower)) return lower
  }
  const fromCountry = currencyForCountry(countryHeader ?? undefined)
  if (fromCountry) return fromCountry
  if (brandDefault) {
    const lower = brandDefault.toLowerCase()
    if (SUPPORTED_CURRENCIES.some((c) => c.code === lower)) return lower
  }
  return DEFAULT.code
}
