import { ConfirmationClient } from "./confirmation-client"
import { privatePageMetadata } from "@/lib/seo"

export const metadata = privatePageMetadata("Order confirmed")

type Params = Promise<{ orderId: string }>

export default async function ConfirmationPage({ params }: { params: Params }) {
  const { orderId } = await params
  return <ConfirmationClient orderId={orderId} />
}
