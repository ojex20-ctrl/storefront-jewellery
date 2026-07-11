"use client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingBag, FileText, Image, Settings, LogOut, Images, Tags, Ticket, Users, Inbox } from "lucide-react"

export function Sidebar({ userName }: { userName?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const links = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/collections", icon: Tags, label: "Collections" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { href: "/admin/customers", icon: Users, label: "Customers" },
    { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
    { href: "/admin/inbox", icon: Inbox, label: "Inbox" },
    { href: "/admin/content", icon: FileText, label: "Content" },
    { href: "/admin/banners", icon: Image, label: "Banners" },
    { href: "/admin/media", icon: Images, label: "Gallery" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <aside className="admin-sidebar flex w-full flex-col bg-[#0B0B0C] text-white p-4 shrink-0 md:w-56 md:p-6">
      <Link href="/admin" className="font-display text-xl tracking-tight mb-4 block md:mb-10">
        SYRA
      </Link>
      <nav className="flex-1 grid grid-cols-2 gap-1 md:block md:space-y-1">
        {links.map((l) => {
          const isActive = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href))
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest transition-colors rounded ${
                isActive ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <l.icon size={16} />
              {l.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 pt-4 mt-4">
        {userName && <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 truncate">{userName}</p>}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}
