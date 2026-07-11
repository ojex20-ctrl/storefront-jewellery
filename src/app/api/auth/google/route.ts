import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { isGoogleConfigured, googleAuthUrl } from "@/lib/google-auth"

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://syrathelabel.com"

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${SITE}/account/login?error=google_unavailable`)
  }
  const state = crypto.randomBytes(16).toString("hex")
  const cookieStore = await cookies()
  cookieStore.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  })
  return NextResponse.redirect(googleAuthUrl(state))
}
