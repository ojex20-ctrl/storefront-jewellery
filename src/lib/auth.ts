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
  // [MOCK] Simulate network delay
  await new Promise((r) => setTimeout(r, 800))
  return { token: "mock_jwt_token", customer: { ...MOCK_CUSTOMER, email: _email } }
}

export async function register(input: {
  email: string
  password: string
  first_name?: string
  last_name?: string
}): Promise<LoginResult> {
  // [MOCK] Simulate network delay
  await new Promise((r) => setTimeout(r, 800))
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
  // [MOCK] Return mock customer without hitting Medusa
  return MOCK_CUSTOMER
}
