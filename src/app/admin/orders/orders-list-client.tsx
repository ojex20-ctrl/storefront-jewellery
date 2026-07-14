"use client"
import Link from "next/link"
import { Sidebar } from "@/components/admin/sidebar"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"

type Order = {
  id: string; orderNumber: number; firstName: string; lastName: string; email: string
  total: number; status: string; paymentStatus: string; createdAt: Date
}

export function OrdersListClient({ orders }: { orders: Order[] }) {
  const router = useRouter()

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <h1 className="font-display text-4xl tracking-tight mb-8">Orders ({orders.length})</h1>

        {orders.length === 0 ? (
          <div className="border border-[#1A1A1C]/10 bg-white p-12 text-center">
            <ShoppingBag size={32} className="mx-auto text-[#1A1A1C]/60 mb-4" />
            <p className="text-sm text-[#1A1A1C]/75">No orders yet. They&apos;ll appear here when customers place orders.</p>
          </div>
        ) : (
          <div className="border border-[#1A1A1C]/10 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F3EF] text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[#1A1A1C]/5 hover:bg-[#F5F3EF]/50">
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-[#c9a36b]">#{o.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p>{o.firstName} {o.lastName}</p>
                      <p className="text-[10px] text-[#1A1A1C]/70">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono">₹{(o.total / 100).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] uppercase tracking-widest ${o.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="text-xs border border-[#1A1A1C]/10 bg-transparent px-2 py-1 outline-none focus:border-[#c9a36b]"
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-[#1A1A1C]/75">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
