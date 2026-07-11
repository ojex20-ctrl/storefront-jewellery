"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Sidebar } from "@/components/admin/sidebar"

type Coupon = {
  id: string
  code: string
  type: string
  value: number
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  active: boolean
  expiresAt: string | null
}

const EMPTY = { code: "", type: "percentage", value: "", minOrder: "", maxUses: "", expiresAt: "", active: true }

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`

export function CouponsClient({ coupons, user }: { coupons: Coupon[]; user: { name: string } }) {
  const [items, setItems] = useState(coupons)
  const [draft, setDraft] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const code = draft.code.trim().toUpperCase()
    const value = Number(draft.value)
    if (!code || !(value > 0)) {
      toast.error("Enter a code and a value greater than 0.")
      return
    }
    setSaving(true)
    const payload = {
      code,
      type: draft.type,
      value: draft.type === "percentage" ? Math.round(value) : Math.round(value * 100),
      minOrder: draft.minOrder ? Math.round(Number(draft.minOrder) * 100) : null,
      maxUses: draft.maxUses ? Math.round(Number(draft.maxUses)) : null,
      expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
      active: draft.active,
    }
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      toast.error(d.error || "Could not create coupon (code may already exist)")
      return
    }
    const { coupon } = await res.json()
    setItems((cur) => [{ ...coupon, expiresAt: coupon.expiresAt ?? null }, ...cur])
    setDraft(EMPTY)
    toast.success(`Coupon ${code} created`)
  }

  const toggle = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    })
    if (!res.ok) return toast.error("Update failed")
    setItems((cur) => cur.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)))
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
    if (!res.ok) return toast.error("Delete failed")
    setItems((cur) => cur.filter((x) => x.id !== id))
    toast.success("Coupon deleted")
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user.name} />
      <main className="flex-1 p-8 md:p-12">
        <h1 className="mb-8 font-display text-4xl tracking-tight">Coupons</h1>

        <section className="mb-8 grid items-end gap-4 border border-[#1A1A1C]/10 bg-white p-6 md:grid-cols-6">
          <Field label="Code" value={draft.code} onChange={(v) => setDraft({ ...draft, code: v.toUpperCase() })} />
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">Type</span>
            <select
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]"
            >
              <option value="percentage">Percentage %</option>
              <option value="fixed">Fixed ₹</option>
            </select>
          </label>
          <Field label={draft.type === "percentage" ? "Value (%)" : "Value (₹)"} value={draft.value} onChange={(v) => setDraft({ ...draft, value: v })} />
          <Field label="Min order (₹)" value={draft.minOrder} onChange={(v) => setDraft({ ...draft, minOrder: v })} />
          <Field label="Max uses" value={draft.maxUses} onChange={(v) => setDraft({ ...draft, maxUses: v })} />
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">Expires</span>
            <input
              type="date"
              value={draft.expiresAt}
              onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value })}
              className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]"
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="self-end bg-[#0B0B0C] px-4 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-[#c9a36b] disabled:opacity-50 md:col-span-1"
          >
            {saving ? "…" : "Add coupon"}
          </button>
        </section>

        <div className="overflow-x-auto border border-[#1A1A1C]/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/50">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Discount</th>
                <th className="px-4 py-3 text-left">Min order</th>
                <th className="px-4 py-3 text-left">Uses</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[#1A1A1C]/40">No coupons yet.</td></tr>
              )}
              {items.map((c) => (
                <tr key={c.id} className="border-t border-[#1A1A1C]/5">
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3">{c.type === "percentage" ? `${c.value}%` : rupees(c.value)}</td>
                  <td className="px-4 py-3">{c.minOrder ? rupees(c.minOrder) : "—"}</td>
                  <td className="px-4 py-3">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-4 py-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(c)}
                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${c.active ? "bg-green-100 text-green-700" : "bg-[#1A1A1C]/10 text-[#1A1A1C]/50"}`}
                    >
                      {c.active ? "Active" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(c.id)} className="text-xs uppercase tracking-widest text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}
