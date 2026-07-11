import { CartClient } from "./cart-client"

export const metadata = {
  title: "Your Bag",
  description: "Review the pieces in your bag before checkout.",
}

export default function CartPage() {
  return <CartClient />
}
