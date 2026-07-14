"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Kept in sync with ORDER_STATUSES in lib/order-status (not imported to avoid
// pulling server-only modules into the client bundle).
const ORDER_STATUSES = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]

export function OrderStatusChanger({ orderId, current }: { orderId: string; current: string }) {
  const router = useRouter()
  const [status, setStatus] = useState(current)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status, note: note || undefined }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      toast.error(d.error || "Could not update status")
      return
    }
    toast.success(`Order marked ${status.replace(/_/g, " ")}`)
    setNote("")
    router.refresh()
  }

  return (
    <div className="border border-[#1A1A1C]/10 bg-white p-5">
      <p className="mb-3 text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">Update status</p>
      <div className="flex flex-col gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-[#1A1A1C]/15 bg-transparent px-3 py-2 text-sm capitalize outline-none focus:border-[#c9a36b]"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional) — e.g. tracking id"
          className="border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]"
        />
        <button
          onClick={save}
          disabled={saving || status === current}
          className="bg-[#0B0B0C] px-4 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-[#c9a36b] disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save status"}
        </button>
      </div>
    </div>
  )
}
