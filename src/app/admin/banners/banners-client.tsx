"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus, Save, Trash2, Image } from "lucide-react"

type Banner = {
  id: string; title: string; subtitle: string | null; image: string
  mobileImage: string | null; link: string | null; position: string
  page: string; published: boolean; sortOrder: number
}

export function BannersClient({ banners }: { banners: Banner[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)

  const handleAdd = async () => {
    await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "New Banner", image: "", page: "home", position: "hero", published: false, sortOrder: banners.length }),
    })
    router.refresh()
  }

  const handleSave = async (banner: Banner) => {
    setSaving(banner.id)
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(banner),
    })
    setSaving(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <aside className="hidden md:flex w-56 flex-col bg-[#0B0B0C] text-white p-6">
        <Link href="/admin" className="font-display text-xl tracking-tight mb-10">SYRA</Link>
        <nav className="flex-1 space-y-1">
          <Link href="/admin" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60">Dashboard</Link>
          <Link href="/admin/products" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60">Products</Link>
          <Link href="/admin/orders" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60">Orders</Link>
          <Link href="/admin/content" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60">Content</Link>
          <Link href="/admin/banners" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white bg-white/10 rounded">Banners</Link>
          <Link href="/admin/settings" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60">Settings</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl tracking-tight">Banners ({banners.length})</h1>
          <button onClick={handleAdd} className="inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#c9a36b]">
            <Plus size={14} /> Add Banner
          </button>
        </div>

        <div className="space-y-6">
          {banners.map((b) => (
            <BannerEditor key={b.id} banner={b} saving={saving === b.id} onSave={handleSave} onDelete={() => handleDelete(b.id)} />
          ))}
        </div>

        {banners.length === 0 && (
          <div className="border border-[#1A1A1C]/10 bg-white p-12 text-center">
            <Image size={32} className="mx-auto text-[#1A1A1C]/20 mb-4" />
            <p className="text-sm text-[#1A1A1C]/50">No banners yet. Add one to get started.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function BannerEditor({ banner, saving, onSave, onDelete }: {
  banner: Banner; saving: boolean; onSave: (b: Banner) => void; onDelete: () => void
}) {
  const [form, setForm] = useState(banner)
  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="border border-[#1A1A1C]/10 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="accent-[#c9a36b]" />
            Published
          </label>
          <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/40">{form.position} · {form.page}</span>
        </div>
        <button onClick={onDelete} className="text-[#1A1A1C]/30 hover:text-red-500"><Trash2 size={14} /></button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Title" value={form.title} onChange={(v) => set("title", v)} />
        <Field label="Subtitle" value={form.subtitle ?? ""} onChange={(v) => set("subtitle", v)} />
        <Field label="Image URL" value={form.image} onChange={(v) => set("image", v)} />
        <Field label="Mobile Image URL" value={form.mobileImage ?? ""} onChange={(v) => set("mobileImage", v)} />
        <Field label="Link" value={form.link ?? ""} onChange={(v) => set("link", v)} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Page" value={form.page} onChange={(v) => set("page", v)} />
          <Field label="Position" value={form.position} onChange={(v) => set("position", v)} />
        </div>
      </div>
      {form.image && <div className="mt-4 h-24 w-full bg-cover bg-center border border-[#1A1A1C]/10 rounded" style={{ backgroundImage: `url(${form.image})` }} />}
      <button onClick={() => onSave(form)} disabled={saving}
        className="mt-4 inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#c9a36b] disabled:opacity-50">
        <Save size={12} /> {saving ? "Saving…" : "Save"}
      </button>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}
