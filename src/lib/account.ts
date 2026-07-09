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
  const resp = await fetch("/api/account/profile", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!resp.ok) throw new Error("Failed to update profile")
  return resp.json()
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

export async function requestPasswordReset(email: string) {
  const resp = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!resp.ok) throw new Error("Failed to request reset")
  return resp.json()
}

export async function performPasswordReset(token: string, password: string) {
  const resp = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, newPassword: password }),
  })
  if (!resp.ok) throw new Error("Failed to reset password")
  return resp.json()
}
