"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Package, Plus, Upload, Trash2, Eye, EyeOff } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"

type Product = {
  id: string; name: string; slug: string; kind: string; price: number
  image: string; tag: string | null; published: boolean; createdAt: Date
}

const FALLBACK_IMAGES: Record<string, string> = {
  Ring: "/jewellery/gen-diamond-ring.png",
  Necklace: "/jewellery/gen-gold-necklace.png",
  Earrings: "/jewellery/gen-crystal-earrings.png",
  Bracelet: "/jewellery/gen-gold-bracelet.png",
  "Nose ring": "/jewellery/gen-pink-heart-ring.png",
  "Nose Ring": "/jewellery/gen-pink-heart-ring.png",
}

function productImage(product: Product) {
  return product.image || FALLBACK_IMAGES[product.kind] || FALLBACK_IMAGES.Ring
}

export function ProductsListClient({ products, user }: { products: Product[]; user: { name: string } }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return
    setDeleting(id)
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    setSelectedIds((prev) => prev.filter((x) => x !== id))
    router.refresh()
    setDeleting(null)
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} selected products?`)) return
    setBulkDeleting(true)
    const res = await fetch("/api/admin/products/bulk", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: selectedIds }),
    })
    if (res.ok) {
      setSelectedIds([])
      router.refresh()
    } else {
      alert("Failed to delete products")
    }
    setBulkDeleting(false)
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
    <div className="admin-layout flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user?.name} />

      <main className="admin-content flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="admin-page-header flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl tracking-tight">Products ({products.length})</h1>
          <div className="admin-actions flex gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} /> Delete Selected ({selectedIds.length})
              </button>
            )}
            <Link href="/admin/products/bulk-upload" className="inline-flex items-center gap-2 border border-[#1A1A1C]/20 px-4 py-2 text-xs uppercase tracking-widest hover:border-[#c9a36b]">
              <Upload size={14} /> Bulk Upload
            </Link>
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#c9a36b]">
              <Plus size={14} /> Add Product
            </Link>
          </div>
        </div>

        <div className="products-table border border-[#1A1A1C]/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F3EF] text-[10px] uppercase tracking-widest text-[#1A1A1C]/75">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.length === products.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(products.map((p) => p.id))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                    className="accent-[#c9a36b]"
                  />
                </th>
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
                  <td className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, p.id])
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== p.id))
                        }
                      }}
                      className="accent-[#c9a36b]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-8 bg-cover bg-center border border-[#1A1A1C]/10 rounded-sm" style={{ backgroundImage: `url(${productImage(p)})` }} />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-[10px] text-[#1A1A1C]/70">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#1A1A1C]/75">{p.kind}</td>
                  <td className="px-4 py-3 font-mono">₹{(p.price / 100).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {p.tag && <span className="bg-[#c9a36b]/10 text-[#c9a36b] px-2 py-0.5 text-[10px] uppercase tracking-widest">{p.tag}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(p.id, p.published)} className="text-[10px] uppercase tracking-widest">
                      {p.published ? <span className="text-green-600 flex items-center gap-1"><Eye size={12} /> Live</span> : <span className="text-[#1A1A1C]/70 flex items-center gap-1"><EyeOff size={12} /> Draft</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${p.id}`} className="text-xs text-[#c9a36b] hover:underline">Edit</Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="text-[#1A1A1C]/75 hover:text-red-500 transition-colors"
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

        <div className="mobile-products-list hidden">
          {products.map((p) => (
            <article key={p.id} className="mobile-product-card border border-[#1A1A1C]/10 bg-white">
              <div className="h-[88px] w-[72px] overflow-hidden rounded-sm border border-[#1A1A1C]/10 bg-[#F5F3EF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImage(p)} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold leading-tight">{p.name}</h2>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#1A1A1C]/45">{p.kind}</p>
                <p className="mt-2 font-mono text-sm">₹{(p.price / 100).toLocaleString()}</p>
                <button onClick={() => togglePublish(p.id, p.published)} className="mt-2 text-[10px] uppercase tracking-widest">
                  {p.published ? <span className="text-green-600 flex items-center gap-1"><Eye size={12} /> Live</span> : <span className="text-[#1A1A1C]/70 flex items-center gap-1"><EyeOff size={12} /> Draft</span>}
                </button>
              </div>
              <div className="mobile-product-actions">
                <Link href={`/admin/products/${p.id}`} className="inline-flex items-center justify-center border border-[#1A1A1C]/15 px-3 py-2 text-xs uppercase tracking-widest text-[#1A1A1C]">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="inline-flex items-center justify-center gap-2 border border-red-200 px-3 py-2 text-xs uppercase tracking-widest text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
