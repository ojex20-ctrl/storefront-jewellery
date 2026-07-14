import { OrderTrackClient } from "./order-track-client"
import { buildPageMetadata } from "@/lib/seo"

export const metadata = buildPageMetadata({
  title: "Track Your SYRA Order",
  description: "Track your SYRA jewellery order status by order details.",
  path: "/order-track",
  noIndex: true,
})

export default function OrderTrackPage() {
  return <OrderTrackClient />
}
