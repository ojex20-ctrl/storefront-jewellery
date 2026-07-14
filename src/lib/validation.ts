const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/
const PHONE_CHARS_PATTERN = /^[+]?[-()\d\s]{8,24}$/
const POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,12}$/
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const COUPON_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,31}$/
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,120}$/
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/
const URL_OR_PATH_PATTERN = /^(\/[^\s<>]*)$|^https?:\/\/[^\s<>]+$/i

export function normalizeEmailAddress(value: unknown) {
  return String(value ?? "").trim().toLowerCase().slice(0, 254)
}

export function isValidEmail(value: unknown) {
  const email = normalizeEmailAddress(value)
  if (!email || email.length > 254 || email.includes("..")) return false
  const [local, domain] = email.split("@")
  return Boolean(local && domain && local.length <= 64 && EMAIL_PATTERN.test(email))
}

export function normalizePhoneNumber(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 24)
}

export function phoneDigits(value: unknown) {
  return normalizePhoneNumber(value).replace(/[^\d]/g, "")
}

export function isValidPhone(value: unknown, options: { required?: boolean } = {}) {
  const phone = normalizePhoneNumber(value)
  if (!phone) return !options.required
  const digits = phoneDigits(phone)
  return PHONE_CHARS_PATTERN.test(phone) && digits.length >= 8 && digits.length <= 15
}

export function isValidName(value: unknown, options: { required?: boolean; max?: number } = {}) {
  const text = String(value ?? "").trim()
  if (!text) return !options.required
  return text.length <= (options.max ?? 80) && !/[<>]/.test(text)
}

export function isValidPlainText(value: unknown, options: { required?: boolean; min?: number; max?: number } = {}) {
  const text = String(value ?? "").trim()
  if (!text) return !options.required
  return text.length >= (options.min ?? 1) && text.length <= (options.max ?? 500) && !/[<>]/.test(text)
}

export function isValidPostalCode(value: unknown, options: { required?: boolean } = {}) {
  const text = String(value ?? "").trim()
  if (!text) return !options.required
  return POSTAL_PATTERN.test(text)
}

export function isValidOtp(value: unknown) {
  return /^\d{6}$/.test(String(value ?? "").trim())
}

export function normalizeCouponCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "").slice(0, 32)
}

export function isValidCouponCode(value: unknown) {
  return COUPON_PATTERN.test(normalizeCouponCode(value))
}

export function normalizeSlug(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120)
}

export function isValidSlug(value: unknown) {
  return SLUG_PATTERN.test(String(value ?? "").trim())
}

export function isValidSafeId(value: unknown) {
  return SAFE_ID_PATTERN.test(String(value ?? "").trim())
}

export function isValidToken(value: unknown) {
  return TOKEN_PATTERN.test(String(value ?? "").trim())
}

export function isValidUrlOrPath(value: unknown, options: { required?: boolean } = {}) {
  const text = String(value ?? "").trim()
  if (!text) return !options.required
  return text.length <= 500 && URL_OR_PATH_PATTERN.test(text)
}

export function isValidDateLike(value: unknown, options: { required?: boolean } = {}) {
  if (value === null || value === undefined || value === "") return !options.required
  return !Number.isNaN(new Date(String(value)).getTime())
}

export function toNonNegativeInt(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(0, Math.round(number))
}

export function isPositiveMoney(value: unknown) {
  const number = typeof value === "number" ? value : Number(value)
  return Number.isInteger(number) && number > 0 && number <= 100_000_000
}

export function isNonNegativeMoney(value: unknown) {
  const number = typeof value === "number" ? value : Number(value)
  return Number.isInteger(number) && number >= 0 && number <= 100_000_000
}

export function isStrongPassword(value: unknown) {
  const password = String(value ?? "")
  return password.length >= 8 && password.length <= 128 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

export function validationError(message: string, status = 400) {
  return { error: message, status }
}
