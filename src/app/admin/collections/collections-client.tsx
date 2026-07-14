"use client"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { Sidebar } from "@/components/admin/sidebar"

type Category = {
  id: string
  name: string
  slug: string
  image: string | null
  description: string | null
  sortOrder: number
}

const EMPTY = { name: "", slug: "", image: "", description: "", sortOrder: 0 }

export function CollectionsClient({
  categories,
  user,
}: {
  categories: Category[]
  user: { name: string }
}) {
  const [items, setItems] = useState(categories)
  const [draft, setDraft] = useState(EMPTY)

  const save = async () => {
    const resp = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(draft),
    })
    if (!resp.ok) {
      toast.error("Collection save failed")
      return
    }
    const data = await resp.json() as { category: Category }
    setItems((cur) => [...cur, data.category].sort((a, b) => a.sortOrder - b.sortOrder))
    setDraft(EMPTY)
    toast.success("Collection created")
  }

  const remove = async (id: string) => {
    const resp = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    if (!resp.ok) {
      toast.error("Collection delete failed")
      return
    }
    setItems((cur) => cur.filter((item) => item.id !== id))
    toast.success("Collection deleted")
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user.name} />
      <main className="flex-1 p-8 md:p-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-4xl tracking-tight">Collections</h1>
          <Link href="/admin/products" className="text-xs uppercase tracking-widest text-[#1A1A1C]/75 hover:text-[#c9a36b]">Products</Link>
        </div>
        <section className="mb-8 grid gap-4 border border-[#1A1A1C]/10 bg-white p-6 md:grid-cols-5">
          <Field label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
          <Field label="Slug" value={draft.slug} onChange={(slug) => setDraft({ ...draft, slug })} />
          <Field label="Image URL" value={draft.image} onChange={(image) => setDraft({ ...draft, image })} />
          <Field label="Sort" value={String(draft.sortOrder)} onChange={(sortOrder) => setDraft({ ...draft, sortOrder: Number(sortOrder) })} />
          <button onClick={save} className="self-end bg-[#0B0B0C] px-4 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-[#c9a36b]">Add</button>
          <div className="md:col-span-5">
            <Field label="Description" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} />
          </div>
        </section>
        <div className="overflow-hidden border border-[#1A1A1C]/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-xs uppercase tracking-widest text-[#1A1A1C]/75">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Sort</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[#1A1A1C]/5">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{item.slug}</td>
                  <td className="px-4 py-3">{item.sortOrder}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(item.id)} className="text-xs uppercase tracking-widest text-red-600">Delete</button>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}
