"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Save, ArrowLeft, X } from "lucide-react"
import { Sidebar } from "@/components/admin/sidebar"

type Product = {
  id: string; name: string; slug: string; kind: string; caption: string; description: string
  price: number; compareAtPrice: number | null; metals: string; stones: string; sizes: string
  tag: string | null; image: string; gallery: string; modelImages: string; bundleIds: string
  weight: number | null; material: string | null; warranty: string | null
  seoTitle: string | null; seoDescription: string | null; published: boolean; featured: boolean
  mainHierarchy: string | null; subHierarchy: string | null
  images?: string[]
  mainHierarchies?: string[]
  subHierarchies?: string[]
  kinds?: string[]
  ringTypes?: string[]
  tags?: string[]
}

const MAIN_HIERARCHIES = ["Best Sellers", "Earrings", "Necklace", "Bracelets", "Rings", "Pendants"]
const SUB_HIERARCHIES = ["Boss Babe Basic", "Glam Girl Hours", "Everyday Slay", "Main Character Campus", "Bold Babe Edit"]
const KIND_OPTIONS = [
  "Ring", "Necklace", "Earrings", "Bracelet", "Nose ring",
  "Stud", "Hoop", "Huggie", "Drop", "Dangler", "Ear Cuff", "Statement", "Minimal",
  "Chain", "Choker", "Pendant", "Layered", "Charm", "Kada", "Cuff",
  "Chain Bracelet", "Charm Bracelet", "Adjustable", "Stackable", "Band", "Solitaire", "Cocktail"
]
const RING_TYPE_OPTIONS = [
  "Adjustable", "Stackable", "Band", "Statement Ring", "Minimal Ring", "Solitaire Look", "Cocktail Ring", "Open Ring", "Couple Ring"
]
const TAGS_OPTIONS = [
  "Anti Tarnish", "Waterproof", "Daily Wear", "Office Wear", "Party Wear", "College Wear",
  "Date Night", "Minimal", "Statement", "Trending", "New Arrival", "Gift Pick", "Premium Look",
  "Under 499", "Under 999", "Lightweight", "Skin Friendly", "Gold Finish", "Silver Finish", "Rose Gold Finish"
]

interface FormState {
  name: string
  slug: string
  price: string
  compareAtPrice: string
  metals: string
  stones: string
  sizes: string
  images: string[]
  imageUrlInput: string
  mainHierarchies: string[]
  subHierarchies: string[]
  kinds: string[]
  ringTypes: string[]
  tags: string[]
  caption: string
  description: string
  weight: string
  material: string
  warranty: string
  seoTitle: string
  seoDescription: string
  published: boolean
  featured: boolean
}

const createEmptyForm = (): FormState => ({
  name: "",
  slug: "",
  price: "",
  compareAtPrice: "",
  metals: "18k Gold",
  stones: "None",
  sizes: "",
  images: [],
  imageUrlInput: "",
  mainHierarchies: [],
  subHierarchies: [],
  kinds: ["Ring"],
  ringTypes: [],
  tags: [],
  caption: "",
  description: "",
  weight: "",
  material: "Surgical Steel + 18k Gold PVD",
  warranty: "2 Year Anti-Tarnish Guarantee",
  seoTitle: "",
  seoDescription: "",
  published: true,
  featured: false,
})

export function ProductFormClient({ product }: { product: Product | null }) {
  const router = useRouter()
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState<Record<number, boolean>>({})

  const [forms, setForms] = useState<FormState[]>([
    {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      price: product ? String(product.price) : "",
      compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice) : "",
      metals: product ? JSON.parse(product.metals).join("; ") : "18k Gold",
      stones: product ? JSON.parse(product.stones).join("; ") : "None",
      sizes: product ? JSON.parse(product.sizes).join("; ") : "",
      images: product?.images ? (typeof product.images === "string" ? JSON.parse(product.images) : product.images) : (product?.image ? [product.image] : []),
      imageUrlInput: product?.images ? (typeof product.images === "string" ? JSON.parse(product.images) : product.images).join(", ") : (product?.image ? product.image : ""),
      mainHierarchies: product?.mainHierarchies ? (typeof product.mainHierarchies === "string" ? JSON.parse(product.mainHierarchies) : product.mainHierarchies) : (product?.mainHierarchy ? [product.mainHierarchy] : []),
      subHierarchies: product?.subHierarchies ? (typeof product.subHierarchies === "string" ? JSON.parse(product.subHierarchies) : product.subHierarchies) : (product?.subHierarchy ? [product.subHierarchy] : []),
      kinds: product?.kinds ? (typeof product.kinds === "string" ? JSON.parse(product.kinds) : product.kinds) : (product?.kind ? [product.kind] : ["Ring"]),
      ringTypes: product?.ringTypes ? (typeof product.ringTypes === "string" ? JSON.parse(product.ringTypes) : product.ringTypes) : [],
      tags: product?.tags ? (typeof product.tags === "string" ? JSON.parse(product.tags) : product.tags) : (product?.tag ? [product.tag] : []),
      caption: product?.caption ?? "",
      description: product?.description ?? "",
      weight: product?.weight ? String(product.weight) : "",
      material: product?.material ?? "Surgical Steel + 18k Gold PVD",
      warranty: product?.warranty ?? "2 Year Anti-Tarnish Guarantee",
      seoTitle: product?.seoTitle ?? "",
      seoDescription: product?.seoDescription ?? "",
      published: product?.published ?? true,
      featured: product?.featured ?? false,
    }
  ])

  const setFormField = (index: number, key: keyof FormState, value: any) => {
    setForms((prev) => prev.map((f, i) => {
      if (i === index) {
        const updated = { ...f, [key]: value }
        if (key === "images") {
          updated.imageUrlInput = (value as string[]).join(", ")
        }
        return updated
      }
      return f
    }))
  }

  // Uploads for a product go into products/<slug>/ so images stay grouped per
  // product (falls back to products/_unsorted before the slug/name is filled in).
  const productFolder = (index: number) => {
    const item = forms[index]
    const slug = (item?.slug || item?.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    return slug ? `products/${slug}` : "products/_unsorted"
  }

  const handleImagesUpload = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    const currentImages = forms[index].images
    if (currentImages.length + files.length > 6) {
      alert("Maximum 6 images allowed per product.")
      return
    }

    const folder = productFolder(index)
    const uploadedUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.url) {
          uploadedUrls.push(data.url)
        }
      } catch (err) {
        console.error("Upload error", err)
      }
    }
    if (uploadedUrls.length > 0) {
      setFormField(index, "images", [...currentImages, ...uploadedUrls])
    }
  }

  const handleGalleryUpload = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    const folder = productFolder(index)
    const uploadedUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)
      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.url) {
          uploadedUrls.push(data.url)
        }
      } catch (err) {
        console.error("Upload error", err)
      }
    }
    if (uploadedUrls.length > 0) {
      const currentGallery = forms[index].gallery ? forms[index].gallery.split("\n").filter(Boolean) : []
      const updatedGallery = [...currentGallery, ...uploadedUrls]
      // Set to advanced gallery field
      // We don't store gallery separately since images acts as the product gallery, but let's sync with it if they use it.
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    for (let i = 0; i < forms.length; i++) {
      const f = forms[i]
      const prefix = forms.length > 1 ? `Product ${i + 1}: ` : ""

      if (!f.name.trim()) {
        alert(`${prefix}Product name is required.`)
        return
      }

      if (!f.price || isNaN(Number(f.price)) || Number(f.price) < 0) {
        alert(`${prefix}Price must be a valid positive number.`)
        return
      }

      if (f.images.length > 6) {
        alert(`${prefix}Maximum 6 images allowed per product.`)
        return
      }

      // Validate checkboxes match lists
      for (const val of f.mainHierarchies) {
        if (!MAIN_HIERARCHIES.includes(val)) {
          alert(`${prefix}Invalid Main Hierarchy: '${val}'`)
          return
        }
      }
      for (const val of f.subHierarchies) {
        if (!SUB_HIERARCHIES.includes(val)) {
          alert(`${prefix}Invalid Sub Hierarchy: '${val}'`)
          return
        }
      }
      for (const val of f.kinds) {
        if (!KIND_OPTIONS.includes(val)) {
          alert(`${prefix}Invalid Kind: '${val}'`)
          return
        }
      }
      for (const val of f.ringTypes) {
        if (!RING_TYPE_OPTIONS.includes(val)) {
          alert(`${prefix}Invalid Ring Type: '${val}'`)
          return
        }
      }
      for (const val of f.tags) {
        if (!TAGS_OPTIONS.includes(val)) {
          alert(`${prefix}Invalid Tag: '${val}'`)
          return
        }
      }
    }

    setSaving(true)

    try {
      const payload = forms.map((form) => ({
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        price: parseInt(form.price) || 0,
        compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice) : null,
        metals: JSON.stringify(form.metals.split(";").map((s) => s.trim()).filter(Boolean)),
        stones: JSON.stringify(form.stones.split(";").map((s) => s.trim()).filter(Boolean)),
        sizes: JSON.stringify(form.sizes.split(";").map((s) => s.trim()).filter(Boolean)),
        caption: form.caption,
        description: form.description,
        weight: form.weight ? parseFloat(form.weight) : null,
        material: form.material || null,
        warranty: form.warranty || null,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        published: form.published,
        featured: form.featured,
        
        // Multi-select arrays:
        images: form.images,
        mainHierarchies: form.mainHierarchies,
        subHierarchies: form.subHierarchies,
        kinds: form.kinds,
        ringType: form.ringTypes,
        tags: form.tags,
      }))

      if (isEdit) {
        const url = `/api/admin/products/${product.id}`
        const res = await fetch(url, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload[0]),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to update product")
        }
      } else {
        const url = "/api/admin/products"
        const bodyToSend = forms.length > 1 ? payload : payload[0]
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(bodyToSend),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to save product(s)")
        }
        alert(forms.length > 1 ? "Products added successfully." : "Product added successfully.")
      }

      router.push("/admin/products")
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-layout flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar />

      <main className="admin-content flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="admin-page-header flex items-center justify-between mb-8 border-b border-[#1A1A1C]/10 pb-4">
          <div>
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1C]/50 hover:text-[#1A1A1C] mb-2">
              <ArrowLeft size={14} /> Back to products
            </Link>
            <h1 className="font-display text-4xl tracking-tight">{isEdit ? "Edit Product" : "New Products"}</h1>
          </div>
          {!isEdit && (
            <button
              type="button"
              onClick={() => setForms((prev) => [...prev, createEmptyForm()])}
              className="inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[#c9a36b] transition-colors"
            >
              Add Multiple Products
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="admin-form product-form grid grid-cols-1 gap-8 lg:grid-cols-[2.5fr_1fr]">
          <div className="space-y-6">
            {forms.map((form, index) => {
              const showAdv = showAdvanced[index] || false
              return (
                <div key={index} className="border border-[#1A1A1C]/10 bg-white p-6 relative space-y-5">
                  <div className="flex items-center justify-between border-b border-[#1A1A1C]/10 pb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1C]/80">
                      Product {forms.length > 1 ? `#${index + 1}` : ""}
                    </h3>
                    {forms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setForms((prev) => prev.filter((_, i) => i !== index))
                          setShowAdvanced((prev) => {
                            const next = { ...prev }
                            delete next[index]
                            return next
                          })
                        }}
                        className="text-xs text-red-500 hover:text-red-700 uppercase tracking-widest font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Row 1: Name | Slug | Price */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field
                      label="Name"
                      value={form.name}
                      onChange={(v) => setFormField(index, "name", v)}
                      required
                    />
                    <Field
                      label="Slug (optional)"
                      value={form.slug}
                      onChange={(v) => setFormField(index, "slug", v)}
                      placeholder="auto-generated"
                    />
                    <Field
                      label="Price (in paise, ₹120 = 12000)"
                      value={form.price}
                      onChange={(v) => setFormField(index, "price", v)}
                      type="number"
                      required
                    />
                  </div>

                  {/* Row 2: Multi-select columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 border-t border-[#1A1A1C]/5 pt-3">
                    <ScrollableCheckboxGroup
                      label="Main Hierarchy"
                      values={form.mainHierarchies}
                      options={MAIN_HIERARCHIES}
                      onChange={(v) => setFormField(index, "mainHierarchies", v)}
                    />
                    <ScrollableCheckboxGroup
                      label="Sub Hierarchy"
                      values={form.subHierarchies}
                      options={SUB_HIERARCHIES}
                      onChange={(v) => setFormField(index, "subHierarchies", v)}
                    />
                    <ScrollableCheckboxGroup
                      label="Kind"
                      values={form.kinds}
                      options={KIND_OPTIONS}
                      onChange={(v) => setFormField(index, "kinds", v)}
                    />
                    <ScrollableCheckboxGroup
                      label="Ring Type"
                      values={form.ringTypes}
                      options={RING_TYPE_OPTIONS}
                      onChange={(v) => setFormField(index, "ringTypes", v)}
                    />
                    <ScrollableCheckboxGroup
                      label="Tags"
                      values={form.tags}
                      options={TAGS_OPTIONS}
                      onChange={(v) => setFormField(index, "tags", v)}
                    />
                  </div>

                  {/* Row 3: Image Upload | Image URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end border-t border-[#1A1A1C]/5 pt-3">
                    <div>
                      <Field
                        label="Image URLs (comma-separated, max 6)"
                        value={form.imageUrlInput}
                        onChange={(v) => {
                          setFormField(index, "imageUrlInput", v)
                          const parsed = v.split(",").map((s) => s.trim()).filter(Boolean)
                          setFormField(index, "images", parsed)
                        }}
                        placeholder="/uploads/gallery/ring-1.jpg, /uploads/gallery/ring-2.jpg"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-[#1A1A1C]/50 uppercase tracking-widest">Or Upload Up To 6 Files:</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImagesUpload(index, e.target.files)}
                          disabled={form.images.length >= 6}
                          className="text-xs text-[#1A1A1C]/60 file:mr-3 file:py-1 file:px-2 file:border file:border-[#1A1A1C]/15 file:text-[9px] file:uppercase file:tracking-widest file:bg-transparent file:text-[#1A1A1C]/80 file:cursor-pointer hover:file:bg-[#F5F3EF] disabled:opacity-30"
                        />
                      </div>
                    </div>
                    <div>
                      {form.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {form.images.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="relative w-12 h-16 border border-[#1A1A1C]/10 bg-gray-50 shrink-0">
                              <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${imgUrl})` }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImages = form.images.filter((_, idx) => idx !== imgIdx)
                                  setFormField(index, "images", nextImages)
                                }}
                                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] font-bold hover:bg-red-700 shadow"
                              >
                                <X size={8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Description & Caption */}
                  <div className="grid grid-cols-1 gap-4">
                    <TextArea
                      label="Description"
                      value={form.description}
                      onChange={(v) => setFormField(index, "description", v)}
                      rows={2}
                    />
                    <Field
                      label="Caption"
                      value={form.caption}
                      onChange={(v) => setFormField(index, "caption", v)}
                    />
                  </div>

                  {/* Expandable Advanced / Details Section Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((prev) => ({ ...prev, [index]: !showAdv }))}
                      className="text-[10px] text-[#c9a36b] hover:underline uppercase tracking-widest font-bold"
                    >
                      {showAdv ? "Hide Advanced & SEO Details ▲" : "Show Advanced & SEO Details (Compare Price, SEO, Weight, Status...) ▼"}
                    </button>
                  </div>

                  {showAdv && (
                    <div className="border-t border-[#1A1A1C]/5 pt-4 space-y-4 bg-[#F5F3EF]/30 p-4 rounded-sm">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Field
                          label="Compare-at Price"
                          value={form.compareAtPrice}
                          onChange={(v) => setFormField(index, "compareAtPrice", v)}
                          type="number"
                        />
                        <Field
                          label="Weight (grams)"
                          value={form.weight}
                          onChange={(v) => setFormField(index, "weight", v)}
                          type="number"
                        />
                        <Field
                          label="Material"
                          value={form.material}
                          onChange={(v) => setFormField(index, "material", v)}
                        />
                        <Field
                          label="Warranty"
                          value={form.warranty}
                          onChange={(v) => setFormField(index, "warranty", v)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field
                          label="Metals (semicolon-separated)"
                          value={form.metals}
                          onChange={(v) => setFormField(index, "metals", v)}
                          placeholder="18k Gold; White Gold"
                        />
                        <Field
                          label="Stones (semicolon-separated)"
                          value={form.stones}
                          onChange={(v) => setFormField(index, "stones", v)}
                          placeholder="Diamond; None"
                        />
                        <Field
                          label="Sizes (semicolon-separated)"
                          value={form.sizes}
                          onChange={(v) => setFormField(index, "sizes", v)}
                          placeholder="6; 7; 8"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                          label="SEO Title"
                          value={form.seoTitle}
                          onChange={(v) => setFormField(index, "seoTitle", v)}
                        />
                        <Field
                          label="SEO Description"
                          value={form.seoDescription}
                          onChange={(v) => setFormField(index, "seoDescription", v)}
                        />
                      </div>

                      <div className="flex gap-6 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.published}
                            onChange={(e) => setFormField(index, "published", e.target.checked)}
                            className="h-4 w-4 accent-[#c9a36b]"
                          />
                          <span className="text-xs uppercase tracking-wider text-[#1A1A1C]/70">Published</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={(e) => setFormField(index, "featured", e.target.checked)}
                            className="h-4 w-4 accent-[#c9a36b]"
                          />
                          <span className="text-xs uppercase tracking-wider text-[#1A1A1C]/70">Featured</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {!isEdit && (
              <button
                type="button"
                onClick={() => setForms((prev) => [...prev, createEmptyForm()])}
                className="w-full border border-dashed border-[#1A1A1C]/25 py-4 bg-white hover:bg-[#F5F3EF]/50 hover:border-[#c9a36b] text-xs uppercase tracking-widest transition-colors font-semibold"
              >
                + Add Another Product
              </button>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-8 self-start">
            <Card title={isEdit ? "Status & Summary" : "Upload Summary"}>
              <div className="space-y-2 text-sm text-[#1A1A1C]/70">
                <div className="flex justify-between">
                  <span>Total Forms:</span>
                  <span className="font-semibold">{forms.length}</span>
                </div>
                <div className="border-t border-[#1A1A1C]/5 pt-2 max-h-60 overflow-y-auto">
                  <ul className="space-y-2">
                    {forms.map((f, i) => (
                      <li key={i} className="flex justify-between text-xs gap-2">
                        <span className="truncate max-w-[130px] font-semibold text-[#1A1A1C]/90">
                          {f.name.trim() || `Product #${i + 1}`}
                        </span>
                        <span className="font-mono text-[10px] text-[#1A1A1C]/60 shrink-0">
                          ₹{((parseInt(f.price) || 0) / 100).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#0B0B0C] text-white py-3.5 text-xs uppercase tracking-widest hover:bg-[#c9a36b] transition-colors disabled:opacity-50 font-semibold"
            >
              <Save size={14} /> {saving ? "Saving…" : forms.length > 1 ? "Save All Products" : isEdit ? "Update Product" : "Save Product"}
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

function ScrollableCheckboxGroup({ label, values, options, onChange }: { label: string; values: string[]; options: string[]; onChange: (v: string[]) => void }) {
  const displayLabel = label === "Ring" ? "Ring Type" : label
  const summary = values.length > 0 ? values.join(", ") : `Select ${displayLabel}`
  return (
    <div className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{displayLabel}</span>
      <details className="admin-multiselect mt-1 rounded-sm border border-[#1A1A1C]/10 bg-white">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs text-[#1A1A1C]">
          <span className="min-w-0 truncate">{summary}</span>
          <span className="shrink-0 text-[#c9a36b]">Select</span>
        </summary>
        <div className="grid max-h-64 gap-1 overflow-y-auto border-t border-[#1A1A1C]/10 p-2">
          {options.map((opt) => {
            if (!opt) return null
            const isChecked = values.includes(opt)
            return (
              <label key={opt} className="flex min-h-10 items-center gap-3 rounded-sm px-2 text-sm">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...values, opt])
                    else onChange(values.filter((v) => v !== opt))
                  }}
                  className="h-4 w-4 shrink-0 accent-[#c9a36b]"
                />
                <span className="min-w-0 text-[#1A1A1C]/80">{opt}</span>
              </label>
            )
          })}
        </div>
      </details>
    </div>
  )
}
