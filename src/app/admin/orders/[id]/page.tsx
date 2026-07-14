import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { Sidebar } from "@/components/admin/sidebar"
import { OrderStatusChanger } from "./status-changer"

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`

type LineItem = { name?: string; productId?: string; size?: string; qty?: number; price?: number }

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")
  const { id } = await params

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) notFound()
  const history = await prisma.orderStatusHistory.findMany({
    where: { orderId: id },
    orderBy: { createdAt: "desc" },
  })

  let items: LineItem[] = []
  try { items = JSON.parse(order.items) } catch { items = [] }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={session.name} />
      <main className="flex-1 p-8 md:p-12">
        <Link href="/admin/orders" className="text-xs uppercase tracking-widest text-[#1A1A1C]/75 hover:text-[#c9a36b]">← Orders</Link>
        <div className="mb-8 mt-3 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-4xl tracking-tight">Order #{order.orderNumber}</h1>
          <span className="rounded-full bg-[#1A1A1C]/10 px-3 py-1 text-[11px] uppercase tracking-widest capitalize">{order.status.replace(/_/g, " ")}</span>
          <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-widest capitalize ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : order.paymentStatus === "failed" ? "bg-red-100 text-red-700" : "bg-[#1A1A1C]/10 text-[#1A1A1C]/75"}`}>
            {order.paymentStatus}
          </span>
          <span className="font-mono text-xs text-[#1A1A1C]/75">{order.createdAt.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {/* Line items */}
            <div className="mb-8 overflow-hidden border border-[#1A1A1C]/10 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/75">
                  <tr>
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} className="border-t border-[#1A1A1C]/5">
                      <td className="px-4 py-3">
                        {it.productId ? (
                          <Link href={`/products/${it.productId}`} className="hover:text-[#c9a36b]">{it.name ?? it.productId}</Link>
                        ) : (it.name ?? "Item")}
                        {it.size ? <span className="ml-2 text-[#1A1A1C]/70">· {it.size}</span> : null}
                      </td>
                      <td className="px-4 py-3">{it.qty ?? 1}</td>
                      <td className="px-4 py-3 text-right">{rupees(Number(it.price ?? 0))}</td>
                      <td className="px-4 py-3 text-right">{rupees(Number(it.price ?? 0) * Number(it.qty ?? 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-[#1A1A1C]/10 p-4">
                <TotalRow label="Subtotal" value={rupees(order.subtotal)} />
                <TotalRow label="Shipping" value={order.shippingCost ? rupees(order.shippingCost) : "FREE"} />
                {order.discount > 0 && <TotalRow label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`− ${rupees(order.discount)}`} />}
                <div className="mt-2 flex justify-between border-t border-[#1A1A1C]/10 pt-2 font-display text-xl">
                  <span>Total</span><span>{rupees(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Status history */}
            <h2 className="mb-3 font-display text-2xl">History</h2>
            <div className="border border-[#1A1A1C]/10 bg-white">
              {history.length === 0 ? (
                <p className="p-4 text-sm text-[#1A1A1C]/70">No status changes recorded yet.</p>
              ) : (
                <ul className="divide-y divide-[#1A1A1C]/5">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="capitalize">
                        {h.oldStatus ? `${h.oldStatus.replace(/_/g, " ")} → ` : ""}
                        <strong>{h.newStatus.replace(/_/g, " ")}</strong>
                        {h.note ? <span className="ml-2 text-[#1A1A1C]/75">— {h.note}</span> : null}
                      </span>
                      <span className="font-mono text-xs text-[#1A1A1C]/70">{h.createdAt.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar: status changer + customer + shipping */}
          <div className="flex flex-col gap-6">
            <OrderStatusChanger orderId={order.id} current={order.status} />

            <div className="border border-[#1A1A1C]/10 bg-white p-5 text-sm">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">Customer</p>
              <p className="font-medium">{`${order.firstName} ${order.lastName}`.trim()}</p>
              <p className="text-[#1A1A1C]/70">{order.email}</p>
              <p className="text-[#1A1A1C]/70">{order.phone}</p>
            </div>

            <div className="border border-[#1A1A1C]/10 bg-white p-5 text-sm">
              <p className="mb-3 text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">Shipping address</p>
              <p className="text-[#1A1A1C]/70">{order.address}</p>
              <p className="text-[#1A1A1C]/70">{order.city}, {order.state} {order.pincode}</p>
              <p className="text-[#1A1A1C]/70">{order.country}</p>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-[#1A1A1C]/70">
                Payment · {order.paymentMethod || "razorpay"}{order.paymentId ? ` · ${order.paymentId}` : ""}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-[#1A1A1C]/75">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
