import type { Customer } from "@/stores/auth-store"

/**
 * Loads the current customer from the httpOnly session cookie via /api/auth/me.
 * The real login/register flows live in their route handlers and client pages
 * (they call /api/auth/* directly); there is deliberately no mock fallback here.
 */
export async function refreshCustomer(_token: string): Promise<Customer | null> {
  const resp = await fetch("/api/auth/me", { credentials: "include" }).catch(() => null)
  if (!resp?.ok) return null
  const data = await resp.json() as {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      phone?: string
      authProvider?: "password" | "google" | "external"
      canChangePassword?: boolean
    }
  }
  return {
    id: data.user.id,
    email: data.user.email,
    first_name: data.user.firstName,
    last_name: data.user.lastName,
    phone: data.user.phone ?? "",
    auth_provider: data.user.authProvider ?? null,
    can_change_password: data.user.canChangePassword ?? null,
  }
}
