import { redirect } from "next/navigation"

export default function AccountOrderAliasPage({ params }: { params: { id: string } }) {
  redirect(`/account/orders/${params.id}`)
}
