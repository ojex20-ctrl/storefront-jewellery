import { OrderDetailClient } from "./order-detail-client"

export const metadata = { title: "Order tracking" }

type Params = Promise<{ id: string }>
export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params
  return <OrderDetailClient orderId={id} />
}
