import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminPassword, createAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth"
import { rateLimit, requestIp, validRequestOrigin } from "@/lib/rate-limit"
import { isValidEmail, normalizeEmailAddress } from "@/lib/validation"

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  if (!rateLimit(`admin-login:${requestIp(req)}`, 10)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  const { email: rawEmail, password } = await req.json().catch(() => ({}))
  const email = normalizeEmailAddress(rawEmail)
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  if (!isValidEmail(email) && !/^[a-z0-9._-]{2,60}$/i.test(email)) return NextResponse.json({ error: "Enter a valid admin login." }, { status: 400 })
  const user = await verifyAdminPassword(email, String(password))
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const token = createAdminToken(user)
  const cookieStore = await cookies()
  const forwardedProto = req.headers.get("x-forwarded-proto")
  const isHttps = forwardedProto ? forwardedProto.split(",")[0]?.trim() === "https" : new URL(req.url).protocol === "https:"
  const options = { httpOnly: true, secure: isHttps, sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" } as const
  cookieStore.set(ADMIN_COOKIE, token, options)
  cookieStore.set("admin_token", token, options)
  return NextResponse.json({ user })
}
