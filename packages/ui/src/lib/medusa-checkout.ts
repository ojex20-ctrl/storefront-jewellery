/**
 * Storefront-side helpers for driving a real Medusa cart → order flow.
 *
 * The previous flow was a local stub: checkout generated a fake order id
 * (PD-XXXXXX), pushed to a Zustand store, never told Medusa. As a result
 * Medusa's admin order list, customer /account/orders, payment webhooks,
 * and order-fulfilment all stayed empty.
 *
 * This helper replaces that with the real Medusa v2 cart endpoints:
 *
 *   1. createCart()                  → POST /store/carts
 *   2. addLineItem()                 → POST /store/carts/:id/line-items
 *   3. updateCart()                  → PATCH /store/carts/:id (email + address)
 *   4. listShippingOptions()         → GET  /store/shipping-options?cart_id
 *   5. addShippingMethod()           → POST /store/carts/:id/shipping-methods
 *   6. createPaymentCollection()     → POST /store/payment-collections
 *   7. initPaymentSession(provider)  → POST /store/payment-collections/:id/payment-sessions
 *   8. completeCart()                → POST /store/carts/:id/complete
 *
 * Step 7 returns the provider's `data` payload (Razorpay order id, Stripe
 * client secret, …) so the caller can drive the popup. Step 8 returns
 * `{ order }` once the payment is captured / authorised.
 *
 * Used by every storefront's checkout-client.tsx — the helper is
 * brand-agnostic, only reads what's passed in.
 */

export type MedusaCheckoutConfig = {
  backendUrl: string
  publishableKey: string
}

export type MedusaCart = {
  id: string
  region_id: string
  email?: string | null
  currency_code: string
  shipping_address?: Record<string, unknown> | null
  total: number
  subtotal: number
  shipping_total: number
  items?: { id: string; variant_id: string; quantity: number }[]
}

export type MedusaPaymentCollection = {
  id: string
  amount: number
  currency_code: string
  payment_sessions?: { id: string; provider_id: string; data?: Record<string, unknown> }[]
}

export type MedusaOrder = {
  id: string
  display_id: number
  status: string
  payment_status?: string
  fulfillment_status?: string
  email?: string
  total: number
}

export type CheckoutAddress = {
  first_name: string
  last_name: string
  address_1: string
  city: string
  postal_code: string
  country_code: string
  phone: string
  province?: string
  company?: string
}

export type LineItemInput = {
  variant_id: string
  quantity: number
  metadata?: Record<string, unknown>
}

export class MedusaCheckoutError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export function createMedusaCheckout(cfg: MedusaCheckoutConfig) {
  const { backendUrl, publishableKey } = cfg

  function headers(extra?: Record<string, string>): HeadersInit {
    return {
      "content-type": "application/json",
      "x-publishable-api-key": publishableKey,
      ...(extra ?? {}),
    }
  }

  async function call<T>(
    path: string,
    init?: RequestInit & { token?: string },
  ): Promise<T> {
    const auth = init?.token ? { authorization: `Bearer ${init.token}` } : undefined
    const r = await fetch(`${backendUrl}${path}`, {
      ...init,
      headers: headers({ ...auth, ...(init?.headers as Record<string, string>) }),
      cache: "no-store",
    })
    if (!r.ok) {
      let body: unknown = null
      try {
        body = await r.json()
      } catch {
        try {
          body = await r.text()
        } catch {
          body = null
        }
      }
      throw new MedusaCheckoutError(
        `${init?.method ?? "GET"} ${path} → ${r.status}`,
        r.status,
        body,
      )
    }
    return (await r.json()) as T
  }

  /** Pick the region whose `currency_code` matches our hint, or the first one. */
  async function pickRegion(currencyCode = "aed"): Promise<{ id: string; currency_code: string }> {
    const j = await call<{
      regions: { id: string; currency_code: string }[]
    }>(`/store/regions`)
    const match =
      j.regions.find(
        (r) => r.currency_code.toLowerCase() === currencyCode.toLowerCase(),
      ) ?? j.regions[0]
    if (!match) throw new Error("No regions configured in Medusa")
    return match
  }

  async function createCart(args: {
    regionId: string
    email?: string
    salesChannelId?: string
  }): Promise<MedusaCart> {
    const j = await call<{ cart: MedusaCart }>(`/store/carts`, {
      method: "POST",
      body: JSON.stringify({
        region_id: args.regionId,
        ...(args.email ? { email: args.email } : {}),
        ...(args.salesChannelId ? { sales_channel_id: args.salesChannelId } : {}),
      }),
    })
    return j.cart
  }

  async function addLineItem(cartId: string, item: LineItemInput): Promise<MedusaCart> {
    const j = await call<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/line-items`,
      {
        method: "POST",
        body: JSON.stringify(item),
      },
    )
    return j.cart
  }

  async function updateCart(
    cartId: string,
    patch: {
      email?: string
      shipping_address?: CheckoutAddress
      billing_address?: CheckoutAddress
    },
  ): Promise<MedusaCart> {
    const j = await call<{ cart: MedusaCart }>(`/store/carts/${cartId}`, {
      method: "POST",
      body: JSON.stringify(patch),
    })
    return j.cart
  }

  async function listShippingOptions(cartId: string): Promise<
    { id: string; name: string; amount: number }[]
  > {
    const j = await call<{ shipping_options: { id: string; name: string; amount: number }[] }>(
      `/store/shipping-options?cart_id=${cartId}`,
    )
    return j.shipping_options
  }

  async function addShippingMethod(
    cartId: string,
    optionId: string,
  ): Promise<MedusaCart> {
    const j = await call<{ cart: MedusaCart }>(
      `/store/carts/${cartId}/shipping-methods`,
      {
        method: "POST",
        body: JSON.stringify({ option_id: optionId }),
      },
    )
    return j.cart
  }

  async function createPaymentCollection(cartId: string): Promise<MedusaPaymentCollection> {
    const j = await call<{ payment_collection: MedusaPaymentCollection }>(
      `/store/payment-collections`,
      {
        method: "POST",
        body: JSON.stringify({ cart_id: cartId }),
      },
    )
    return j.payment_collection
  }

  async function initPaymentSession(
    collectionId: string,
    providerId: string,
    data?: Record<string, unknown>,
  ): Promise<MedusaPaymentCollection> {
    const j = await call<{ payment_collection: MedusaPaymentCollection }>(
      `/store/payment-collections/${collectionId}/payment-sessions`,
      {
        method: "POST",
        body: JSON.stringify({ provider_id: providerId, ...(data ? { data } : {}) }),
      },
    )
    return j.payment_collection
  }

  async function completeCart(
    cartId: string,
  ): Promise<{ type: "order"; order: MedusaOrder } | { type: "cart"; cart: MedusaCart }> {
    const j = await call<
      | { type: "order"; order: MedusaOrder }
      | { type: "cart"; cart: MedusaCart }
    >(`/store/carts/${cartId}/complete`, { method: "POST" })
    return j
  }

  /**
   * Convenience: do the whole pre-payment dance for a one-shot checkout.
   * Returns the cart + the payment session + provider id so the caller
   * can drive the popup, and a `finalise()` helper that completes the
   * cart after payment captures.
   *
   * Usage:
   *   const co = createMedusaCheckout({ backendUrl, publishableKey })
   *   const { cart, paymentSession, finalise } = await co.beginCheckout({
   *     items: [{ variant_id, quantity }],
   *     email, address, providerId, currencyCode, customerToken,
   *   })
   *   // Drive the gateway popup using paymentSession.data
   *   const { order } = await finalise()
   *   router.push(`/confirmation/${order.id}`)
   */
  async function beginCheckout(args: {
    items: LineItemInput[]
    email: string
    address: CheckoutAddress
    providerId: string
    currencyCode?: string
    customerToken?: string
    salesChannelId?: string
    /** Optional explicit shipping option id; when omitted we pick the first one. */
    shippingOptionId?: string
  }) {
    const region = await pickRegion(args.currencyCode ?? "aed")

    let cart = await createCart({
      regionId: region.id,
      email: args.email,
      salesChannelId: args.salesChannelId,
    })

    // Line items — sequential so Medusa doesn't race on the cart row.
    for (const item of args.items) {
      cart = await addLineItem(cart.id, item)
    }

    cart = await updateCart(cart.id, {
      email: args.email,
      shipping_address: args.address,
      billing_address: args.address,
    })

    let shippingOptionId = args.shippingOptionId
    if (!shippingOptionId) {
      const opts = await listShippingOptions(cart.id)
      if (opts.length === 0) {
        throw new MedusaCheckoutError(
          "No shipping options available for this cart's region. Configure at least one in Medusa admin → Shipping.",
          412,
          opts,
        )
      }
      shippingOptionId = opts[0]!.id
    }
    cart = await addShippingMethod(cart.id, shippingOptionId)

    const collection = await createPaymentCollection(cart.id)
    const updated = await initPaymentSession(collection.id, args.providerId)
    const session = updated.payment_sessions?.find(
      (s) => s.provider_id === args.providerId,
    )
    if (!session) {
      throw new MedusaCheckoutError(
        `No payment session for provider "${args.providerId}". Is the provider attached to the region?`,
        500,
        updated,
      )
    }

    return {
      cart,
      paymentCollection: updated,
      paymentSession: session,
      finalise: async () => completeCart(cart.id),
    }
  }

  return {
    pickRegion,
    createCart,
    addLineItem,
    updateCart,
    listShippingOptions,
    addShippingMethod,
    createPaymentCollection,
    initPaymentSession,
    completeCart,
    beginCheckout,
  }
}
