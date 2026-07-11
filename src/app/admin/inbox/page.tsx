import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { Sidebar } from "@/components/admin/sidebar"

export default async function AdminInboxPage() {
  const session = await verifyAdminSession()
  if (!session) redirect("/admin/login")

  const [messages, subscribers, restock] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.backInStockSubscription.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ])

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={session.name} />
      <main className="flex-1 p-8 md:p-12">
        <h1 className="mb-8 font-display text-4xl tracking-tight">Inbox</h1>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <Stat label="Enquiries" value={String(messages.length)} />
          <Stat label="Newsletter" value={String(subscribers.length)} />
          <Stat label="Restock alerts" value={String(restock.length)} />
        </div>

        <Section title="Enquiries & messages">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/50">
              <tr>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">When</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[#1A1A1C]/40">No messages yet.</td></tr>}
              {messages.map((m) => (
                <tr key={m.id} className="border-t border-[#1A1A1C]/5 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.name}</p>
                    <p className="font-mono text-xs text-[#1A1A1C]/50">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{m.type}</td>
                  <td className="max-w-[420px] px-4 py-3 text-[#1A1A1C]/80">{m.subject ? <strong>{m.subject}: </strong> : null}{m.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[#1A1A1C]/50">{m.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Newsletter subscribers">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/50">
              <tr><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Source</th><th className="px-4 py-3 text-left">Joined</th></tr>
            </thead>
            <tbody>
              {subscribers.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-[#1A1A1C]/40">No subscribers yet.</td></tr>}
              {subscribers.map((s) => (
                <tr key={s.id} className="border-t border-[#1A1A1C]/5">
                  <td className="px-4 py-3 font-mono text-xs">{s.email}</td>
                  <td className="px-4 py-3">{s.source ?? "—"}</td>
                  <td className="px-4 py-3 text-[#1A1A1C]/50">{s.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Back-in-stock alerts">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/50">
              <tr><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Requested</th></tr>
            </thead>
            <tbody>
              {restock.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-[#1A1A1C]/40">No alerts yet.</td></tr>}
              {restock.map((r) => (
                <tr key={r.id} className="border-t border-[#1A1A1C]/5">
                  <td className="px-4 py-3 font-mono text-xs">{r.productId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.email}</td>
                  <td className="px-4 py-3 text-[#1A1A1C]/50">{r.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-2xl">{title}</h2>
      <div className="overflow-x-auto border border-[#1A1A1C]/10 bg-white">{children}</div>
    </section>
  )
}
