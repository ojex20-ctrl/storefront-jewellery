export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
}

function authUrl(path: string) {
  return `${process.env.SUPABASE_URL?.replace(/\/$/, "")}/auth/v1${path}`
}

function headers(token?: string) {
  const key = process.env.SUPABASE_ANON_KEY ?? ""
  return {
    apikey: key,
    authorization: `Bearer ${token ?? key}`,
    "content-type": "application/json",
  }
}

export async function supabaseSignUp(input: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) {
  if (!isSupabaseConfigured()) throw new Error("Supabase customer login is not configured yet.")
  const resp = await fetch(authUrl("/signup"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      data: {
        first_name: input.firstName ?? "",
        last_name: input.lastName ?? "",
        phone: input.phone ?? "",
      },
    }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data?.msg || data?.error_description || "Supabase registration failed")
  return data as { user?: { id?: string; email?: string }; access_token?: string }
}

export async function supabasePasswordLogin(input: { email: string; password: string }) {
  if (!isSupabaseConfigured()) throw new Error("Supabase customer login is not configured yet.")
  const resp = await fetch(authUrl("/token?grant_type=password"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email: input.email, password: input.password }),
  })
  const data = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new Error(data?.msg || data?.error_description || "Invalid email or password")
  return data as {
    access_token: string
    user: { id: string; email?: string; user_metadata?: { first_name?: string; last_name?: string; phone?: string } }
  }
}

export async function supabaseForgotPassword(email: string) {
  if (!isSupabaseConfigured()) throw new Error("Supabase customer login is not configured yet.")
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"}/reset-password`
  const resp = await fetch(authUrl("/recover"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, redirect_to: redirectTo }),
  })
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}))
    throw new Error(data?.msg || data?.error_description || "Password reset failed")
  }
}
