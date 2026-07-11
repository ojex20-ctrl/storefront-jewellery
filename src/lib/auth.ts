import type { Customer } from "@/stores/auth-store"

// [MOCK] Backend disabled for UI-only development.
// All auth functions return mock data without hitting Medusa.

// const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
// const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

type LoginResult = { token: string; customer: Customer }

const MOCK_CUSTOMER: Customer = {
  id: "mock-customer-01",
  email: "demo@syra.com",
  first_name: "Demo",
  last_name: "User",
}

export async function login(_email: string, _password: string): Promise<LoginResult> {
  const resp = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: _email, password: _password }),
  }).catch(() => null)
  if (resp?.ok) {
    const data = await resp.json() as { user: { id: string; email: string; firstName: string; lastName: string } }
    return {
      token: "customer_cookie",
      customer: { id: data.user.id, email: data.user.email, first_name: data.user.firstName, last_name: data.user.lastName },
    }
  }
  await new Promise((r) => setTimeout(r, 300))
  return { token: "mock_jwt_token", customer: { ...MOCK_CUSTOMER, email: _email } }
}

export async function register(input: {
  email: string
  password: string
  first_name?: string
  last_name?: string
}): Promise<LoginResult> {
  const resp = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      confirmPassword: input.password,
      firstName: input.first_name ?? "New",
      lastName: input.last_name ?? "User",
    }),
  }).catch(() => null)
  if (resp?.ok) {
    return {
      token: "pending_verification",
      customer: {
        id: "pending",
        email: input.email,
        first_name: input.first_name ?? "New",
        last_name: input.last_name ?? "User",
      },
    }
  }
  await new Promise((r) => setTimeout(r, 300))
  return {
    token: "mock_jwt_token",
    customer: {
      id: "mock-customer-01",
      email: input.email,
      first_name: input.first_name ?? "New",
      last_name: input.last_name ?? "User",
    },
  }
}

export async function refreshCustomer(_token: string): Promise<Customer | null> {
  const resp = await fetch("/api/auth/me", { credentials: "include" }).catch(() => null)
  if (!resp?.ok) return null
  const data = await resp.json() as { user: { id: string; email: string; firstName: string; lastName: string; phone?: string } }
  return {
    id: data.user.id,
    email: data.user.email,
    first_name: data.user.firstName,
    last_name: data.user.lastName,
    phone: data.user.phone ?? "",
  }
}
