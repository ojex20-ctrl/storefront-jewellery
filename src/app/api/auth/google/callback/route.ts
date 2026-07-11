import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { fetchGoogleUser } from "@/lib/google-auth"
import { createCustomerToken, CUSTOMER_COOKIE, normalizeEmail } from "@/lib/customer-auth"
import { sendEmail, welcomeEmail } from "@/lib/email"

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://syrathelabel.com"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const cookieStore = await cookies()
  const savedState = cookieStore.get("g_oauth_state")?.value
  cookieStore.delete("g_oauth_state")

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${SITE}/account/login?error=google_state`)
  }

  try {
    const g = await fetchGoogleUser(code)
    const email = normalizeEmail(g.email)
    const firstName = g.given_name || (g.name?.split(" ")[0] ?? "")
    const lastName = g.family_name || (g.name?.split(" ").slice(1).join(" ") ?? "")

    const existing = await prisma.customer.findUnique({ where: { email } })
    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        googleId: g.sub,
        avatar: g.picture ?? existing?.avatar ?? null,
        verified: true,
        emailVerified: true,
        // Backfill names only if we don't already have them.
        firstName: existing?.firstName || firstName,
        lastName: existing?.lastName || lastName,
      },
      create: {
        email,
        passwordHash: "google", // OAuth account — no local password
        googleId: g.sub,
        avatar: g.picture ?? null,
        firstName,
        lastName,
        verified: true,
        emailVerified: true,
      },
    })

    if (!existing) {
      const { subject, html } = welcomeEmail(customer.firstName)
      await sendEmail({ to: customer.email, subject, html }).catch(() => {})
    }

    const token = createCustomerToken({
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    })
    const opts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    }
    cookieStore.set(CUSTOMER_COOKIE, token, opts)
    cookieStore.set("customer_token", token, opts)

    return NextResponse.redirect(`${SITE}/account`)
  } catch {
    return NextResponse.redirect(`${SITE}/account/login?error=google_failed`)
  }
}
