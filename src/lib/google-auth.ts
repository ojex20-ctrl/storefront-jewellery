import "server-only"

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://syrathelabel.com"

export function isGoogleConfigured() {
  return Boolean(CLIENT_ID && CLIENT_SECRET)
}

export function googleRedirectUri() {
  return `${SITE}/api/auth/google/callback`
}

/** Build the Google consent screen URL. */
export function googleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID ?? "",
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

type GoogleUser = {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
}

/** Exchange an auth code for tokens and return the Google profile. */
export async function fetchGoogleUser(code: string): Promise<GoogleUser> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID ?? "",
      client_secret: CLIENT_SECRET ?? "",
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  })
  const token = (await tokenRes.json()) as { access_token?: string; error?: string; error_description?: string }
  if (!tokenRes.ok || !token.access_token) {
    throw new Error(token.error_description || token.error || "Google token exchange failed")
  }

  const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${token.access_token}` },
  })
  const info = (await infoRes.json()) as GoogleUser
  if (!infoRes.ok || !info.email) throw new Error("Could not read Google profile")
  return info
}
