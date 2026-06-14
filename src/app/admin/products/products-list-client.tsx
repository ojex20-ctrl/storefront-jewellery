"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Package, Plus, Upload, Trash2, Eye, EyeOff } from "lucide-react"

type Product = {
  id: string; name: string; slug: string; kind: string; price: number
  image: string; tag: string | null; published: boolean; createdAt: Date
}

export function ProductsListClient({ products, user }: { products: Product[]; user: { name: string } }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    setDeleting(id)
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    router.refresh()
    setDeleting(null)
  }

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ published: !published }),
    })
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <aside className="hidden md:flex w-56 flex-col bg-[#0B0B0C] text-white p-6">
        <Link href="/admin" className="font-display text-xl tracking-tight mb-10">SYRA</Link>
        <nav className="flex-1 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Dashboard</Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest text-white bg-white/10 rounded">Products</Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Orders</Link>
          <Link href="/admin/content" className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Content</Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Settings</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl tracking-tight">Products ({products.length})</h1>
          <div className="flex gap-3">
            <Link href="/admin/products/bulk-upload" className="inline-flex items-center gap-2 border border-[#1A1A1C]/20 px-4 py-2 text-xs uppercase tracking-widest hover:border-[#c9a36b]">
              <Upload size={14} /> Bulk Upload
            </Link>
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#c9a36b]">
              <Plus size={14} /> Add Product
            </Link>
          </div>
        </div>

        <div className="border border-[#1A1A1C]/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Kind</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Tag</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-[#1A1A1C]/5 hover:bg-[#F5F3EF]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <div className="h-10 w-8 bg-cover bg-center border border-[#1A1A1C]/10 rounded-sm" style={{ backgroundImage: `url(${p.image})` }} />
                      )}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-[10px] text-[#1A1A1C]/40">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#1A1A1C]/60">{p.kind}</td>
                  <td className="px-4 py-3 font-mono">₹{(p.price / 100).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {p.tag && <span className="bg-[#c9a36b]/10 text-[#c9a36b] px-2 py-0.5 text-[10px] uppercase tracking-widest">{p.tag}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(p.id, p.published)} className="text-[10px] uppercase tracking-widest">
                      {p.published ? <span className="text-green-600 flex items-center gap-1"><Eye size={12} /> Live</span> : <span className="text-[#1A1A1C]/40 flex items-center gap-1"><EyeOff size={12} /> Draft</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${p.id}`} className="text-xs text-[#c9a36b] hover:underline">Edit</Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="text-[#1A1A1C]/30 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
