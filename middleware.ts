import { NextResponse, type NextRequest } from "next/server"

const ADMIN_COOKIE = "syra_admin_token"
const LEGACY_ADMIN_COOKIE = "admin_token"

function redirectTarget(req: NextRequest, path: string) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "")
  return new URL(path, `${proto}://${host}`)
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/logout")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.json({ error: "Customer login is disabled" }, { status: 410 })
  }

  if (req.method === "GET" && pathname.startsWith("/products/")) {
    const [, section, rawSlug, extra] = pathname.split("/")
    if (section === "products" && rawSlug && !extra) {
      const existsUrl = new URL("/api/products/exists", "http://127.0.0.1:3002")
      existsUrl.searchParams.set("id", decodeURIComponent(rawSlug))

      try {
        const response = await fetch(existsUrl, { cache: "no-store" })
        if (response.status === 404) {
          return new NextResponse(
            "<!doctype html><html><head><title>Product not found</title></head><body><h1>Product not found</h1></body></html>",
            { status: 404, headers: { "content-type": "text/html; charset=utf-8" } },
          )
        }
      } catch {
        return NextResponse.next()
      }
    }
  }

  if (pathname.startsWith("/admin")) {
    const hasAdmin = Boolean(req.cookies.get(ADMIN_COOKIE)?.value || req.cookies.get(LEGACY_ADMIN_COOKIE)?.value)
    if (!hasAdmin) return NextResponse.redirect(redirectTarget(req, `/admin/login?next=${encodeURIComponent(pathname + search)}`))
    return NextResponse.next()
  }

  const customerAuthRoutes = [
    "/account",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ]
  if (customerAuthRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.redirect(redirectTarget(req, "/order-track"))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/products/:path*", "/login", "/register", "/forgot-password", "/reset-password", "/api/auth/:path*"],
}
