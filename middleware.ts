import { NextResponse, type NextRequest } from "next/server"

const ADMIN_COOKIE = "syra_admin_token"
const LEGACY_ADMIN_COOKIE = "admin_token"
const CUSTOMER_COOKIE = "syra_customer_token"
const LEGACY_CUSTOMER_COOKIE = "customer_token"

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/logout")) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    const hasAdmin = Boolean(req.cookies.get(ADMIN_COOKIE)?.value || req.cookies.get(LEGACY_ADMIN_COOKIE)?.value)
    if (!hasAdmin) return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(pathname + search)}`, req.url))
    return NextResponse.next()
  }

  const publicAccountRoutes = [
    "/account/login",
    "/account/register",
    "/account/forgot-password",
    "/account/reset-password",
    "/account/verify",
    "/account/logout",
  ]
  if (publicAccountRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/account")) {
    const hasCustomer = Boolean(req.cookies.get(CUSTOMER_COOKIE)?.value || req.cookies.get(LEGACY_CUSTOMER_COOKIE)?.value)
    if (!hasCustomer) return NextResponse.redirect(new URL(`/account/login?next=${encodeURIComponent(pathname + search)}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
}
