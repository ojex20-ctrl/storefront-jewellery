"use client"
import { Sidebar } from "@/components/admin/sidebar"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Save, Plus, Trash2 } from "lucide-react"

type Section = {
  id: string; section: string; title: string | null; subtitle: string | null
  body: string | null; image: string | null; image2: string | null
  link: string | null; linkText: string | null; metadata: string | null
  published: boolean; sortOrder: number; page: string
}

const PAGES = ["home", "about", "care-guide", "warranty", "contact", "returns", "terms", "privacy"]

export function ContentEditorClient({ sections }: { sections: Section[] }) {
  const router = useRouter()
  const [activePage, setActivePage] = useState("home")
  const [saving, setSaving] = useState<string | null>(null)

  const filtered = sections.filter((s) => s.page === activePage)

  const handleSave = async (section: Section) => {
    setSaving(section.id)
    await fetch(`/api/admin/content/${section.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(section),
    })
    setSaving(null)
    router.refresh()
  }

  const handleAdd = async () => {
    const sectionName = prompt("Section key (e.g. new_section):")
    if (!sectionName) return
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ page: activePage, section: sectionName, published: true, sortOrder: filtered.length }),
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return
    await fetch(`/api/admin/content/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar />

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <h1 className="font-display text-4xl tracking-tight mb-6">Site Content</h1>

        {/* Page tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PAGES.map((p) => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition-colors ${
                activePage === p ? "bg-[#0B0B0C] text-white border-[#0B0B0C]" : "border-[#1A1A1C]/15 hover:border-[#c9a36b]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {filtered.map((s) => (
            <SectionEditor key={s.id} section={s} saving={saving === s.id} onSave={handleSave} onDelete={() => handleDelete(s.id)} />
          ))}
        </div>

        <button
          onClick={handleAdd}
          className="mt-6 inline-flex items-center gap-2 border border-dashed border-[#1A1A1C]/20 px-5 py-3 text-xs uppercase tracking-widest hover:border-[#c9a36b] transition-colors"
        >
          <Plus size={14} /> Add Section
        </button>
      </main>
    </div>
  )
}

function SectionEditor({ section, saving, onSave, onDelete }: {
  section: Section; saving: boolean; onSave: (s: Section) => void; onDelete: () => void
}) {
  const [form, setForm] = useState(section)
  const set = (key: string, value: string | boolean | null) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="border border-[#1A1A1C]/10 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-[#c9a36b] font-bold">{form.section}</h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="accent-[#c9a36b]" />
            Published
          </label>
          <button onClick={onDelete} className="text-[#1A1A1C]/75 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Title" value={form.title ?? ""} onChange={(v) => set("title", v)} />
        <Field label="Subtitle" value={form.subtitle ?? ""} onChange={(v) => set("subtitle", v)} />
        <div className="md:col-span-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">Body</span>
            <textarea value={form.body ?? ""} onChange={(e) => set("body", e.target.value)} rows={3}
              className="mt-1 w-full border border-[#1A1A1C]/10 bg-transparent p-2 text-sm outline-none focus:border-[#c9a36b] resize-y" />
          </label>
        </div>
        <Field label="Image URL" value={form.image ?? ""} onChange={(v) => set("image", v)} />
        <Field label="Image 2 URL" value={form.image2 ?? ""} onChange={(v) => set("image2", v)} />
        <Field label="Link" value={form.link ?? ""} onChange={(v) => set("link", v)} />
        <Field label="Link Text" value={form.linkText ?? ""} onChange={(v) => set("linkText", v)} />
      </div>
      <button
        onClick={() => onSave(form)}
        disabled={saving}
        className="mt-4 inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#c9a36b] disabled:opacity-50"
      >
        <Save size={12} /> {saving ? "Saving…" : "Save"}
      </button>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}
