import { ConfirmationClient } from "./confirmation-client"

export const metadata = { title: "Order confirmed" }

type Params = Promise<{ orderId: string }>

export default async function ConfirmationPage({ params }: { params: Params }) {
  const { orderId } = await params
  return <ConfirmationClient orderId={orderId} />
}
