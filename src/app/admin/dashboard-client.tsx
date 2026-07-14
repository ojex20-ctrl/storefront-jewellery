"use client"
import Link from "next/link"
import { FileText, Package, Upload } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"

type Props = {
  user: { name: string; email: string }
  stats: { products: number; orders: number }
  recentOrders: { id: string; orderNumber: number; firstName: string; lastName: string; total: number; status: string; createdAt: Date }[]
}

export function AdminDashboard({ user, stats, recentOrders }: Props) {
  return (
    <div className="admin-layout flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user.name} />
      <main className="admin-content flex-1 p-8 md:p-12 overflow-y-auto">
        <h1 className="font-display text-4xl tracking-tight mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-10">
          <StatCard label="Products" value={stats.products} href="/admin/products" />
          <StatCard label="Orders" value={stats.orders} href="/admin/orders" />
          <StatCard label="Revenue" value={`₹${(recentOrders.reduce((s, o) => s + o.total, 0) / 100).toLocaleString()}`} />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#c9a36b] transition-colors">
            <Package size={14} /> Add Product
          </Link>
          <Link href="/admin/products/bulk-upload" className="inline-flex items-center gap-2 border border-[#1A1A1C]/20 px-5 py-2.5 text-xs uppercase tracking-widest hover:border-[#c9a36b] transition-colors">
            <Upload size={14} /> Bulk Upload
          </Link>
          <Link href="/admin/content" className="inline-flex items-center gap-2 border border-[#1A1A1C]/20 px-5 py-2.5 text-xs uppercase tracking-widest hover:border-[#c9a36b] transition-colors">
            <FileText size={14} /> Edit Content
          </Link>
          <Link href="/" target="_blank" className="inline-flex items-center gap-2 border border-[#1A1A1C]/20 px-5 py-2.5 text-xs uppercase tracking-widest hover:border-[#c9a36b] transition-colors">
            View Store →
          </Link>
        </div>

        {/* Recent Orders */}
        <h2 className="font-display text-2xl mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-[#1A1A1C]/50">No orders yet.</p>
        ) : (
          <div className="border border-[#1A1A1C]/10 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/50">
                <tr>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-[#1A1A1C]/5 hover:bg-[#F5F3EF]/50">
                    <td className="px-4 py-3 font-mono">#{o.orderNumber}</td>
                    <td className="px-4 py-3">{o.firstName} {o.lastName}</td>
                    <td className="px-4 py-3 font-mono">₹{(o.total / 100).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest rounded-sm ${
                        o.status === "delivered" ? "bg-green-100 text-green-700" :
                        o.status === "shipped" ? "bg-blue-100 text-blue-700" :
                        o.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3 text-[#1A1A1C]/50">{new Date(o.createdAt).toLocaleDateString()}</td>
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

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const inner = (
    <div className="border border-[#1A1A1C]/10 bg-white p-6 hover:border-[#c9a36b] transition-colors">
      <p className="text-xs uppercase tracking-widest text-[#1A1A1C]/50 mb-2">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}
