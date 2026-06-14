// [MOCK] Backend disabled for UI-only development.
// All order fetchers return empty/mock data without hitting Medusa.

// const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
// const KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

export type OrderStatus =
  | "pending"
  | "completed"
  | "shipped"
  | "delivered"
  | "canceled"
  | "archived"

export type OrderItem = {
  id: string
  title: string
  variant_title?: string | null
  thumbnail?: string | null
  unit_price: number
  quantity: number
  subtotal: number
}

export type OrderShippingAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  city?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

export type StoreOrder = {
  id: string
  display_id: number
  status: OrderStatus
  payment_status?: string
  fulfillment_status?: string
  email?: string
  total: number
  subtotal: number
  shipping_total: number
  tax_total: number
  currency_code: string
  created_at: string
  items: OrderItem[]
  shipping_address?: OrderShippingAddress | null
}

/** Paged list of the signed-in customer's orders. */
export async function fetchOrders(
  _token: string,
  _opts: { limit?: number; offset?: number } = {},
): Promise<{ orders: StoreOrder[]; count: number }> {
  // [MOCK] Return empty orders list
  return { orders: [], count: 0 }
}

/** Single order detail — used on the tracking page. */
export async function fetchOrder(_token: string, _id: string): Promise<StoreOrder | null> {
  // [MOCK] Return null — confirmation page falls back to local order store
  return null
}

/** Synthesize a 4-step shipment timeline from order status flags. */
export type TrackingStep = {
  key: "placed" | "confirmed" | "shipped" | "delivered"
  label: string
  done: boolean
  active: boolean
  date?: string
}
export function buildTimeline(o: StoreOrder): TrackingStep[] {
  const status = (o.fulfillment_status ?? "").toLowerCase()
  const placed = true
  const confirmed = ["fulfilled", "shipped", "delivered", "partially_shipped", "partially_delivered"].includes(status) ||
    (o.payment_status ?? "").toLowerCase() === "captured"
  const shipped = ["shipped", "delivered", "partially_shipped", "partially_delivered"].includes(status)
  const delivered = ["delivered"].includes(status)

  const steps: TrackingStep[] = [
    { key: "placed", label: "Order placed", done: placed, active: placed && !confirmed, date: o.created_at },
    { key: "confirmed", label: "Confirmed", done: confirmed, active: confirmed && !shipped },
    { key: "shipped", label: "Shipped", done: shipped, active: shipped && !delivered },
    { key: "delivered", label: "Delivered", done: delivered, active: delivered },
  ]
  return steps
}
