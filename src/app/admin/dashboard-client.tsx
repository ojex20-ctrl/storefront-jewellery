"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Package, ShoppingBag, FileText, Image, Settings, LogOut, Upload } from "lucide-react"

type Props = {
  user: { name: string; email: string }
  stats: { products: number; orders: number }
  recentOrders: { id: string; orderNumber: number; firstName: string; lastName: string; total: number; status: string; createdAt: Date }[]
}

export function AdminDashboard({ user, stats, recentOrders }: Props) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    router.push("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar onLogout={handleLogout} userName={user.name} />
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
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

function Sidebar({ onLogout, userName }: { onLogout: () => void; userName: string }) {
  const links = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { href: "/admin/content", icon: FileText, label: "Content" },
    { href: "/admin/banners", icon: Image, label: "Banners" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <aside className="hidden md:flex w-56 flex-col bg-[#0B0B0C] text-white p-6">
      <div className="font-display text-xl tracking-tight mb-10">SYRA</div>
      <nav className="flex-1 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            <l.icon size={16} />
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{userName}</p>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
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
