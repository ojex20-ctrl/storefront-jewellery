type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}

export function requestIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  )
}

export function validRequestOrigin(req: Request) {
  const origin = req.headers.get("origin")
  if (!origin) return true
  const originHost = new URL(origin).host
  const requestHost = new URL(req.url).host
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
  const host = req.headers.get("host")
  const siteHost = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
    : null

  return [requestHost, forwardedHost, host, siteHost].filter(Boolean).includes(originHost)
}
