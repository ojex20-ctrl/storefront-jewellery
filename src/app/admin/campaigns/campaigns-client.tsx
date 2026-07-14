"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import { Copy, ExternalLink, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Sidebar } from "@/components/admin/sidebar"

type CampaignMetadata = {
  couponCode?: string
  couponLabel?: string
  startsAt?: string
  endsAt?: string
  noIndex?: boolean
  terms?: string
  productKinds?: string[]
  productTags?: string[]
  productSlugs?: string[]
  secondaryCtaHref?: string
  secondaryCtaText?: string
  announcement?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

type Campaign = {
  id: string
  slug: string
  title: string
  subtitle: string
  body: string
  image: string
  link: string
  linkText: string
  published: boolean
  sortOrder: number
  updatedAt: string
  metadata: CampaignMetadata
}

type ProductOption = { slug: string; name: string; kind: string; tag: string | null }

type Draft = {
  id?: string
  slug: string
  title: string
  subtitle: string
  body: string
  image: string
  link: string
  linkText: string
  published: boolean
  sortOrder: string
  couponCode: string
  couponLabel: string
  startsAt: string
  endsAt: string
  noIndex: boolean
  terms: string
  productKinds: string
  productTags: string
  productSlugs: string
  secondaryCtaHref: string
  secondaryCtaText: string
  announcement: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
}

const EMPTY_DRAFT: Draft = {
  slug: "",
  title: "",
  subtitle: "",
  body: "",
  image: "/hero/syra_hero_1.png",
  link: "/collection",
  linkText: "Shop the campaign",
  published: false,
  sortOrder: "0",
  couponCode: "",
  couponLabel: "",
  startsAt: "",
  endsAt: "",
  noIndex: false,
  terms: "",
  productKinds: "",
  productTags: "",
  productSlugs: "",
  secondaryCtaHref: "/collection",
  secondaryCtaText: "Explore all jewellery",
  announcement: "",
  utmSource: "syra",
  utmMedium: "campaign",
  utmCampaign: "",
}

const KINDS = ["Ring", "Earrings", "Necklace", "Bracelet", "Nose ring"]

export function CampaignsClient({
  campaigns,
  products,
  coupons,
  user,
}: {
  campaigns: Campaign[]
  products: ProductOption[]
  coupons: string[]
  user: { name: string }
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(() => ({ ...EMPTY_DRAFT, sortOrder: String(campaigns.length) }))
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const productTags = useMemo(() => Array.from(new Set(products.map((product) => product.tag).filter(Boolean) as string[])).sort(), [products])

  const edit = (campaign: Campaign) => {
    setEditingId(campaign.id)
    setDraft(fromCampaign(campaign))
  }

  const reset = () => {
    setEditingId(null)
    setDraft({ ...EMPTY_DRAFT, sortOrder: String(campaigns.length) })
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    const payload = toPayload(draft)
    if (!payload.slug || !payload.title) {
      toast.error("Slug and title are required.")
      return
    }

    setSaving(true)
    const res = await fetch(editingId ? `/api/admin/campaigns/${editingId}` : "/api/admin/campaigns", {
      method: editingId ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || "Could not save campaign")
      return
    }
    toast.success(editingId ? "Campaign updated" : "Campaign created")
    reset()
    router.refresh()
  }

  const remove = async (campaign: Campaign) => {
    if (!confirm(`Delete campaign ${campaign.slug}?`)) return
    const res = await fetch(`/api/admin/campaigns/${campaign.id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Delete failed")
      return
    }
    toast.success("Campaign deleted")
    if (editingId === campaign.id) reset()
    router.refresh()
  }

  const duplicateUrl = async (campaign: Campaign) => {
    const value = `${window.location.origin}/campaigns/${campaign.slug}`
    await navigator.clipboard.writeText(value).catch(() => null)
    toast.success("Campaign URL copied")
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user.name} />
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl tracking-tight">Campaigns</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1A1A1C]/70">
              Create campaign landing pages with publish schedule, coupon code, tracked CTAs, SEO metadata and selected products.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 border border-[#1A1A1C]/20 px-4 py-2 text-xs uppercase tracking-widest hover:border-[#c9a36b]"
          >
            <Plus size={14} /> New campaign
          </button>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="overflow-x-auto border border-[#1A1A1C]/10 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F3EF] text-[10px] uppercase tracking-widest text-[#1A1A1C]/65">
                <tr>
                  <th className="px-4 py-3 text-left">Campaign</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Schedule</th>
                  <th className="px-4 py-3 text-left">Coupon</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#1A1A1C]/60">No campaigns yet. Create one using the form.</td></tr>
                )}
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-t border-[#1A1A1C]/5 align-top hover:bg-[#F5F3EF]/50">
                    <td className="px-4 py-4">
                      <button onClick={() => edit(campaign)} className="text-left font-display text-xl hover:text-[#c9a36b]">{campaign.title || campaign.slug}</button>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#1A1A1C]/45">/campaigns/{campaign.slug}</p>
                    </td>
                    <td className="px-4 py-4"><Status campaign={campaign} /></td>
                    <td className="px-4 py-4 text-xs leading-5 text-[#1A1A1C]/70">
                      {campaign.metadata.startsAt ? <p>Start: {formatDate(campaign.metadata.startsAt)}</p> : <p>Start: now</p>}
                      {campaign.metadata.endsAt ? <p>End: {formatDate(campaign.metadata.endsAt)}</p> : <p>End: open</p>}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">{campaign.metadata.couponCode || "-"}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => duplicateUrl(campaign)} className="grid h-8 w-8 place-items-center border border-[#1A1A1C]/10 hover:border-[#c9a36b]" title="Copy URL"><Copy size={14} /></button>
                        <Link href={`/campaigns/${campaign.slug}`} target="_blank" className="grid h-8 w-8 place-items-center border border-[#1A1A1C]/10 hover:border-[#c9a36b]" title="Open"><ExternalLink size={14} /></Link>
                        <button onClick={() => remove(campaign)} className="grid h-8 w-8 place-items-center border border-[#1A1A1C]/10 text-red-600 hover:border-red-400" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <form onSubmit={save} className="space-y-5 border border-[#1A1A1C]/10 bg-white p-6">
            <div>
              <h2 className="font-display text-2xl">{editingId ? "Edit campaign" : "New campaign"}</h2>
              <p className="mt-1 text-xs text-[#1A1A1C]/55">Published campaigns are available at /campaigns/slug while their schedule is active.</p>
            </div>

            <Grid2>
              <Field label="Slug" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: slugify(v) })} placeholder="diwali-sale" />
              <Field label="Sort order" value={draft.sortOrder} onChange={(v) => setDraft({ ...draft, sortOrder: v })} />
            </Grid2>
            <Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v, slug: draft.slug || slugify(v), utmCampaign: draft.utmCampaign || slugify(v) })} />
            <Textarea label="Short SEO / hero description" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} rows={2} />
            <Textarea label="Campaign story / supporting copy" value={draft.body} onChange={(v) => setDraft({ ...draft, body: v })} rows={3} />
            <Field label="Hero image URL" value={draft.image} onChange={(v) => setDraft({ ...draft, image: v })} />
            <Grid2>
              <Field label="Primary CTA URL" value={draft.link} onChange={(v) => setDraft({ ...draft, link: v })} />
              <Field label="Primary CTA text" value={draft.linkText} onChange={(v) => setDraft({ ...draft, linkText: v })} />
            </Grid2>

            <Grid2>
              <SelectField label="Coupon" value={draft.couponCode} onChange={(v) => setDraft({ ...draft, couponCode: v })} options={coupons} placeholder="No coupon" />
              <Field label="Coupon label" value={draft.couponLabel} onChange={(v) => setDraft({ ...draft, couponLabel: v })} placeholder="Launch offer" />
              <DateField label="Starts at" value={draft.startsAt} onChange={(v) => setDraft({ ...draft, startsAt: v })} />
              <DateField label="Ends at" value={draft.endsAt} onChange={(v) => setDraft({ ...draft, endsAt: v })} />
            </Grid2>

            <Grid2>
              <MultiSelectField label="Product kinds" value={draft.productKinds} options={KINDS} onChange={(v) => setDraft({ ...draft, productKinds: v })} />
              <MultiSelectField label="Product tags" value={draft.productTags} options={productTags} onChange={(v) => setDraft({ ...draft, productTags: v })} />
            </Grid2>
            <Textarea
              label="Product slugs"
              value={draft.productSlugs}
              onChange={(v) => setDraft({ ...draft, productSlugs: v })}
              placeholder={products.slice(0, 3).map((product) => product.slug).join(", ")}
              rows={2}
            />

            <Grid2>
              <Field label="Secondary CTA URL" value={draft.secondaryCtaHref} onChange={(v) => setDraft({ ...draft, secondaryCtaHref: v })} />
              <Field label="Secondary CTA text" value={draft.secondaryCtaText} onChange={(v) => setDraft({ ...draft, secondaryCtaText: v })} />
            </Grid2>
            <Field label="Announcement pill" value={draft.announcement} onChange={(v) => setDraft({ ...draft, announcement: v })} placeholder="Limited drop live now" />
            <Textarea label="Offer terms" value={draft.terms} onChange={(v) => setDraft({ ...draft, terms: v })} rows={2} />

            <details className="border border-[#1A1A1C]/10 p-4">
              <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-[#1A1A1C]/70">Tracking and SEO</summary>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="UTM source" value={draft.utmSource} onChange={(v) => setDraft({ ...draft, utmSource: v })} />
                <Field label="UTM medium" value={draft.utmMedium} onChange={(v) => setDraft({ ...draft, utmMedium: v })} />
                <Field label="UTM campaign" value={draft.utmCampaign} onChange={(v) => setDraft({ ...draft, utmCampaign: slugify(v) })} />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.noIndex} onChange={(e) => setDraft({ ...draft, noIndex: e.target.checked })} className="accent-[#c9a36b]" />
                Noindex this campaign
              </label>
            </details>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="accent-[#c9a36b]" />
              Published
            </label>

            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#0B0B0C] px-5 py-3 text-xs uppercase tracking-widest text-white hover:bg-[#c9a36b] disabled:opacity-50">
              <Save size={14} /> {saving ? "Saving..." : "Save campaign"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function fromCampaign(campaign: Campaign): Draft {
  return {
    id: campaign.id,
    slug: campaign.slug,
    title: campaign.title,
    subtitle: campaign.subtitle,
    body: campaign.body,
    image: campaign.image,
    link: campaign.link,
    linkText: campaign.linkText,
    published: campaign.published,
    sortOrder: String(campaign.sortOrder),
    couponCode: campaign.metadata.couponCode ?? "",
    couponLabel: campaign.metadata.couponLabel ?? "",
    startsAt: toDateInput(campaign.metadata.startsAt),
    endsAt: toDateInput(campaign.metadata.endsAt),
    noIndex: Boolean(campaign.metadata.noIndex),
    terms: campaign.metadata.terms ?? "",
    productKinds: (campaign.metadata.productKinds ?? []).join(", "),
    productTags: (campaign.metadata.productTags ?? []).join(", "),
    productSlugs: (campaign.metadata.productSlugs ?? []).join(", "),
    secondaryCtaHref: campaign.metadata.secondaryCtaHref ?? "/collection",
    secondaryCtaText: campaign.metadata.secondaryCtaText ?? "Explore all jewellery",
    announcement: campaign.metadata.announcement ?? "",
    utmSource: campaign.metadata.utmSource ?? "syra",
    utmMedium: campaign.metadata.utmMedium ?? "campaign",
    utmCampaign: campaign.metadata.utmCampaign ?? campaign.slug,
  }
}

function toPayload(draft: Draft) {
  return {
    slug: slugify(draft.slug),
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim(),
    body: draft.body.trim(),
    image: draft.image.trim(),
    link: draft.link.trim() || "/collection",
    linkText: draft.linkText.trim() || "Shop the campaign",
    published: draft.published,
    sortOrder: Number(draft.sortOrder) || 0,
    metadata: {
      couponCode: draft.couponCode.trim().toUpperCase(),
      couponLabel: draft.couponLabel.trim(),
      startsAt: toIso(draft.startsAt),
      endsAt: toIso(draft.endsAt),
      noIndex: draft.noIndex,
      terms: draft.terms.trim(),
      productKinds: splitCsv(draft.productKinds),
      productTags: splitCsv(draft.productTags),
      productSlugs: splitCsv(draft.productSlugs).map(slugify),
      secondaryCtaHref: draft.secondaryCtaHref.trim(),
      secondaryCtaText: draft.secondaryCtaText.trim(),
      announcement: draft.announcement.trim(),
      utmSource: draft.utmSource.trim() || "syra",
      utmMedium: draft.utmMedium.trim() || "campaign",
      utmCampaign: slugify(draft.utmCampaign || draft.slug),
    },
  }
}

function Status({ campaign }: { campaign: Campaign }) {
  const now = Date.now()
  const startsAt = campaign.metadata.startsAt ? new Date(campaign.metadata.startsAt).getTime() : null
  const endsAt = campaign.metadata.endsAt ? new Date(campaign.metadata.endsAt).getTime() : null
  const label = !campaign.published ? "Draft" : startsAt && startsAt > now ? "Scheduled" : endsAt && endsAt < now ? "Ended" : "Live"
  const cls = label === "Live" ? "bg-green-100 text-green-700" : label === "Scheduled" ? "bg-blue-100 text-blue-700" : label === "Ended" ? "bg-[#1A1A1C]/10 text-[#1A1A1C]/65" : "bg-yellow-100 text-yellow-700"
  return <span className={`inline-block rounded-full px-2 py-1 text-[10px] uppercase tracking-widest ${cls}`}>{label}</span>
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/70">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/70">{label}</span>
      <input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}

function Textarea({ label, value, placeholder, rows, onChange }: { label: string; value: string; placeholder?: string; rows: number; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/70">{label}</span>
      <textarea value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full resize-y border border-[#1A1A1C]/10 bg-transparent p-2 text-sm outline-none focus:border-[#c9a36b]" />
    </label>
  )
}

function SelectField({ label, value, options, placeholder, onChange }: { label: string; value: string; options: string[]; placeholder: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/70">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]">
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function MultiSelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const selected = new Set(splitCsv(value))
  const toggle = (option: string) => {
    const next = new Set(selected)
    if (next.has(option)) next.delete(option)
    else next.add(option)
    onChange(Array.from(next).join(", "))
  }
  return (
    <div>
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/70">{label}</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.length === 0 && <span className="text-xs text-[#1A1A1C]/45">No options yet</span>}
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={`border px-2.5 py-1 text-[10px] uppercase tracking-widest ${selected.has(option) ? "border-[#0B0B0C] bg-[#0B0B0C] text-white" : "border-[#1A1A1C]/15 hover:border-[#c9a36b]"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean)
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
}

function toIso(value: string) {
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

function toDateInput(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-IN")
}
