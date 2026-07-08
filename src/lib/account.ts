// [MOCK] Backend disabled for UI-only development.
// All account/address functions return mock data without hitting Medusa.

// const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
// const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export type Address = {
  id?: string
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string | null
  city?: string
  postal_code?: string
  country_code?: string
  phone?: string
  is_default_shipping?: boolean
  is_default_billing?: boolean
}

export type ProfileUpdate = {
  first_name?: string
  last_name?: string
  phone?: string
}

export async function updateProfile(_token: string, data: ProfileUpdate) {
  // [MOCK] Simulate save delay
  await new Promise((r) => setTimeout(r, 600))
  return {
    customer: {
      id: "mock-customer-01",
      email: "demo@syra.com",
      first_name: data.first_name ?? "Demo",
      last_name: data.last_name ?? "User",
      phone: data.phone ?? "",
    },
  }
}

export async function listAddresses(_token: string): Promise<Address[]> {
  const resp = await fetch("/api/account/addresses", { credentials: "include" })
  if (!resp.ok) return []
  const data = await resp.json() as { addresses: Address[] }
  return data.addresses
}

export async function addAddress(_token: string, a: Address) {
  const resp = await fetch("/api/account/addresses", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(a),
  })
  if (!resp.ok) throw new Error("Failed to add address")
  return resp.json()
}

export async function updateAddress(_token: string, _id: string, a: Address) {
  await new Promise((r) => setTimeout(r, 600))
  return { customer: { addresses: [a] } }
}

export async function deleteAddress(_token: string, _id: string) {
  const resp = await fetch("/api/account/addresses", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id: _id }),
  })
  if (!resp.ok) throw new Error("Failed to delete address")
  return true
}

/** Trigger a password-reset email — mocked to always succeed. */
export async function requestPasswordReset(_email: string) {
  await new Promise((r) => setTimeout(r, 800))
  // [MOCK] No-op — just resolves successfully
}

/** Submit a new password against a reset token — mocked to always succeed. */
export async function performPasswordReset(_token: string, _password: string) {
  await new Promise((r) => setTimeout(r, 800))
  // [MOCK] No-op — just resolves successfully
}
