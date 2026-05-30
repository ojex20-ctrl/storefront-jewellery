"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Save, ArrowLeft } from "lucide-react"

type Product = {
  id: string; name: string; slug: string; kind: string; caption: string; description: string
  price: number; compareAtPrice: number | null; metals: string; stones: string; sizes: string
  tag: string | null; image: string; gallery: string; modelImages: string; bundleIds: string
  weight: number | null; material: string | null; warranty: string | null
  seoTitle: string | null; seoDescription: string | null; published: boolean; featured: boolean
}

const KINDS = ["Ring", "Necklace", "Earrings", "Bracelet", "Nose Ring", "Anklet"]
const TAGS = ["", "BESTSELLER", "NEW", "ONE OF ONE", "LOW STOCK", "SALE"]

export function ProductFormClient({ product }: { product: Product | null }) {
  const router = useRouter()
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    kind: product?.kind ?? "Ring",
    caption: product?.caption ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : "",
    metals: product ? JSON.parse(product.metals).join("; ") : "18k Gold",
    stones: product ? JSON.parse(product.stones).join("; ") : "None",
    sizes: product ? JSON.parse(product.sizes).join("; ") : "",
    tag: product?.tag ?? "",
    image: product?.image ?? "",
    gallery: product ? JSON.parse(product.gallery).join("\n") : "",
    weight: product?.weight ? String(product.weight) : "",
    material: product?.material ?? "Surgical Steel + 18k Gold PVD",
    warranty: product?.warranty ?? "2 Year Anti-Tarnish Guarantee",
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
    published: product?.published ?? true,
    featured: product?.featured ?? false,
  })

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      kind: form.kind,
      caption: form.caption,
      description: form.description,
      price: parseInt(form.price) || 0,
      compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice) : null,
      metals: JSON.stringify(form.metals.split(";").map((s) => s.trim()).filter(Boolean)),
      stones: JSON.stringify(form.stones.split(";").map((s) => s.trim()).filter(Boolean)),
      sizes: JSON.stringify(form.sizes.split(";").map((s) => s.trim()).filter(Boolean)),
      tag: form.tag || null,
      image: form.image,
      gallery: JSON.stringify(form.gallery.split("\n").map((s) => s.trim()).filter(Boolean)),
      weight: form.weight ? parseFloat(form.weight) : null,
      material: form.material || null,
      warranty: form.warranty || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      published: form.published,
      featured: form.featured,
    }

    const url = isEdit ? `/api/admin/products/${product.id}` : "/api/admin/products"
    const method = isEdit ? "PUT" : "POST"
    await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    router.push("/admin/products")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <aside className="hidden md:flex w-56 flex-col bg-[#0B0B0C] text-white p-6">
        <Link href="/admin" className="font-display text-xl tracking-tight mb-10">SYRA</Link>
        <nav className="flex-1 space-y-1">
          <Link href="/admin" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Dashboard</Link>
          <Link href="/admin/products" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white bg-white/10 rounded">Products</Link>
          <Link href="/admin/orders" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Orders</Link>
          <Link href="/admin/content" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Content</Link>
          <Link href="/admin/settings" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white/60 hover:text-white">Settings</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1C]/50 hover:text-[#1A1A1C] mb-6">
          <ArrowLeft size={14} /> Back to products
        </Link>
        <h1 className="font-display text-4xl tracking-tight mb-8">{isEdit ? "Edit Product" : "New Product"}</h1>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card title="Basic Info">
              <Field label="Name" value={form.name} onChange={(v) => set("name", v)} required />
              <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} placeholder="auto-generated from name" />
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Kind" value={form.kind} options={KINDS} onChange={(v) => set("kind", v)} />
                <SelectField label="Tag" value={form.tag} options={TAGS} onChange={(v) => set("tag", v)} />
              </div>
              <Field label="Caption" value={form.caption} onChange={(v) => set("caption", v)} />
              <TextArea label="Description" value={form.description} onChange={(v) => set("description", v)} rows={4} />
            </Card>

            <Card title="Pricing">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (in paise, ₹120 = 12000)" value={form.price} onChange={(v) => set("price", v)} type="number" required />
                <Field label="Compare-at Price (strikethrough)" value={form.compareAtPrice} onChange={(v) => set("compareAtPrice", v)} type="number" />
              </div>
            </Card>

            <Card title="Variants (semicolon-separated)">
              <Field label="Metals" value={form.metals} onChange={(v) => set("metals", v)} placeholder="18k Gold; White Gold; Rose Gold" />
              <Field label="Stones" value={form.stones} onChange={(v) => set("stones", v)} placeholder="Diamond; Sapphire; None" />
              <Field label="Sizes" value={form.sizes} onChange={(v) => set("sizes", v)} placeholder="6; 7; 8; 9" />
            </Card>

            <Card title="Images">
              <Field label="Main Image URL" value={form.image} onChange={(v) => set("image", v)} />
              <TextArea label="Gallery URLs (one per line)" value={form.gallery} onChange={(v) => set("gallery", v)} rows={4} />
            </Card>

            <Card title="Details">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Weight (grams)" value={form.weight} onChange={(v) => set("weight", v)} type="number" />
                <Field label="Material" value={form.material} onChange={(v) => set("material", v)} />
              </div>
              <Field label="Warranty" value={form.warranty} onChange={(v) => set("warranty", v)} />
            </Card>

            <Card title="SEO">
              <Field label="SEO Title" value={form.seoTitle} onChange={(v) => set("seoTitle", v)} />
              <Field label="SEO Description" value={form.seoDescription} onChange={(v) => set("seoDescription", v)} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Status">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#c9a36b]" />
                <span className="text-sm">Published (visible on store)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer mt-3">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[#c9a36b]" />
                <span className="text-sm">Featured (show on home page)</span>
              </label>
            </Card>

            {form.image && (
              <Card title="Preview">
                <div className="aspect-[3/4] bg-cover bg-center border border-[#1A1A1C]/10" style={{ backgroundImage: `url(${form.image})` }} />
              </Card>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#0B0B0C] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#c9a36b] transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#1A1A1C]/10 bg-white p-6">
      <h3 className="text-xs uppercase tracking-widest text-[#1A1A1C]/50 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="mt-1 w-full border border-[#1A1A1C]/10 bg-transparent p-2 text-sm outline-none focus:border-[#c9a36b] resize-y" />
    </label>
  )
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]">
        {options.map((o) => <option key={o} value={o}>{o || "— None —"}</option>)}
      </select>
    </label>
  )
}
