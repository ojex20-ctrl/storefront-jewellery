import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { Sidebar } from "@/components/admin/sidebar"

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`

export default async function AdminCustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")
  const { id } = await params

  const customer = await prisma.customer.findUnique({ where: { id } })
  if (!customer) notFound()

  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({ where: { email: customer.email }, orderBy: { createdAt: "desc" } }),
    prisma.customerAddress.findMany({ where: { customerId: id }, orderBy: { createdAt: "desc" } }),
  ])
  const spent = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.total, 0)

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={session.name} />
      <main className="flex-1 p-8 md:p-12">
        <Link href="/admin/customers" className="text-xs uppercase tracking-widest text-[#1A1A1C]/75 hover:text-[#c9a36b]">← Customers</Link>
        <h1 className="mb-1 mt-3 font-display text-4xl tracking-tight">
          {`${customer.firstName} ${customer.lastName}`.trim() || customer.email}
        </h1>
        <p className="mb-8 font-mono text-xs text-[#1A1A1C]/75">{customer.email}</p>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Paid spent" value={rupees(spent)} />
          <Stat label="Phone" value={customer.phone || "—"} />
          <Stat label="Verified" value={customer.verified || customer.emailVerified ? "Yes" : "No"} />
        </div>

        <h2 className="mb-3 font-display text-2xl">Orders</h2>
        <div className="mb-10 overflow-x-auto border border-[#1A1A1C]/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/75">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#1A1A1C]/70">No orders yet.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[#1A1A1C]/5">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono hover:text-[#c9a36b]">#{o.orderNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-[#1A1A1C]/75">{o.createdAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 capitalize">{o.paymentStatus}</td>
                  <td className="px-4 py-3 text-right">{rupees(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mb-3 font-display text-2xl">Addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-[#1A1A1C]/70">No saved addresses.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="border border-[#1A1A1C]/10 bg-white p-5 text-sm">
                <p className="font-medium">{a.fullName}</p>
                <p className="text-[#1A1A1C]/70">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}</p>
                <p className="text-[#1A1A1C]/70">{a.city}, {a.state} {a.pincode}, {a.country}</p>
                <p className="mt-1 font-mono text-xs text-[#1A1A1C]/75">{a.phone}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#1A1A1C]/10 bg-white p-4">
      <p className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  )
}
