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

export async function fetchOrders(
  _token: string,
  _opts: { limit?: number; offset?: number } = {},
): Promise<{ orders: StoreOrder[]; count: number }> {
  const resp = await fetch("/api/account/orders", { credentials: "include" })
  if (!resp.ok) return { orders: [], count: 0 }
  const data = await resp.json() as { orders: LocalOrder[] }
  const orders = data.orders.map(localOrderToStoreOrder)
  return { orders, count: orders.length }
}

export async function fetchOrder(_token: string, id: string): Promise<StoreOrder | null> {
  const resp = await fetch(`/api/account/orders/${id}`, { credentials: "include" })
  if (!resp.ok) return null
  const data = await resp.json() as { order: LocalOrder }
  return localOrderToStoreOrder(data.order)
}

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
  const confirmed =
    ["fulfilled", "shipped", "delivered", "partially_shipped", "partially_delivered"].includes(status) ||
    (o.payment_status ?? "").toLowerCase() === "captured"
  const shipped = ["shipped", "delivered", "partially_shipped", "partially_delivered"].includes(status)
  const delivered = ["delivered"].includes(status)

  return [
    { key: "placed", label: "Order placed", done: placed, active: placed && !confirmed, date: o.created_at },
    { key: "confirmed", label: "Confirmed", done: confirmed, active: confirmed && !shipped },
    { key: "shipped", label: "Shipped", done: shipped, active: shipped && !delivered },
    { key: "delivered", label: "Delivered", done: delivered, active: delivered },
  ]
}

type LocalOrder = {
  id: string
  orderNumber: number
  status: string
  paymentStatus: string
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  pincode: string
  country: string
  subtotal: number
  shippingCost: number
  total: number
  items: string
  createdAt: string | Date
}

function localOrderToStoreOrder(order: LocalOrder): StoreOrder {
  return {
    id: order.id,
    display_id: order.orderNumber,
    status: order.status === "cancelled" ? "canceled" : (order.status as OrderStatus),
    payment_status: order.paymentStatus,
    fulfillment_status: order.status,
    email: order.email,
    total: order.total,
    subtotal: order.subtotal,
    shipping_total: order.shippingCost,
    tax_total: 0,
    currency_code: "inr",
    created_at: new Date(order.createdAt).toISOString(),
    items: parseItems(order.items),
    shipping_address: {
      first_name: order.firstName,
      last_name: order.lastName,
      address_1: order.address,
      city: order.city,
      postal_code: order.pincode,
      country_code: order.country,
    },
  }
}

function parseItems(raw: string): OrderItem[] {
  try {
    const parsed = JSON.parse(raw) as Array<{ name?: string; productId?: string; image?: string; price?: number; qty?: number; size?: string }>
    return parsed.map((item, index) => ({
      id: item.productId ?? `item_${index}`,
      title: item.name ?? "SYRA item",
      variant_title: item.size ?? null,
      thumbnail: item.image ?? null,
      unit_price: item.price ?? 0,
      quantity: item.qty ?? 1,
      subtotal: (item.price ?? 0) * (item.qty ?? 1),
    }))
  } catch {
    return []
  }
}
