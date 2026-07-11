"use client"
import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/admin/sidebar"

type Row = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  verified: boolean
  createdAt: string
  orders: number
  spent: number
}

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`

export function CustomersClient({ customers, user }: { customers: Row[]; user: { name: string } }) {
  const [q, setQ] = useState("")
  const filtered = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user.name} />
      <main className="flex-1 p-8 md:p-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-4xl tracking-tight">Customers</h1>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            className="w-64 border border-[#1A1A1C]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#c9a36b]"
          />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Customers" value={String(customers.length)} />
          <Stat label="Verified" value={String(customers.filter((c) => c.verified).length)} />
          <Stat label="With orders" value={String(customers.filter((c) => c.orders > 0).length)} />
          <Stat label="Total revenue" value={rupees(customers.reduce((s, c) => s + c.spent, 0))} />
        </div>

        <div className="overflow-x-auto border border-[#1A1A1C]/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Orders</th>
                <th className="px-4 py-3 text-left">Spent</th>
                <th className="px-4 py-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[#1A1A1C]/40">No customers found.</td></tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-[#1A1A1C]/5 hover:bg-[#F5F3EF]/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-[#c9a36b]">
                      {`${c.firstName} ${c.lastName}`.trim() || "—"}
                    </Link>
                    {c.verified && <span className="ml-2 text-[10px] uppercase tracking-widest text-green-600">✓</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3">{c.spent ? rupees(c.spent) : "—"}</td>
                  <td className="px-4 py-3 text-[#1A1A1C]/60">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#1A1A1C]/10 bg-white p-4">
      <p className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  )
}
