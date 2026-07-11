"use client"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { Sidebar } from "@/components/admin/sidebar"

type IntegrationStatus = {
  razorpayConfigured: boolean
  razorpayKeyId: string
  smtpConfigured: boolean
  supabaseConfigured: boolean
}

export function SettingsClient({
  settings,
  user,
  integrationStatus,
}: {
  settings: Record<string, string>
  user: { name: string }
  integrationStatus?: IntegrationStatus
}) {
  const router = useRouter()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) { toast.error("Save failed"); return }
    toast.success("Settings saved — live on the storefront")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-[#F5F3EF] text-[#1A1A1C]">
      <Sidebar userName={user.name} />
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <h1 className="mb-2 font-display text-4xl tracking-tight">Store Settings</h1>
        <p className="mb-8 text-sm text-[#1A1A1C]/50">Everything here is live on the storefront the moment you save.</p>

        <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
          <Card title="Brand">
            <Field label="Brand name" value={form.brand_name ?? ""} onChange={(v) => set("brand_name", v)} />
            <Field label="Tagline" value={form.tagline ?? ""} onChange={(v) => set("tagline", v)} />
            <Field label="Logo URL (optional)" value={form.logo_url ?? ""} onChange={(v) => set("logo_url", v)} />
          </Card>

          <Card title="Contact">
            <Grid2>
              <Field label="Email" value={form.contact_email ?? ""} onChange={(v) => set("contact_email", v)} />
              <Field label="Phone" value={form.contact_phone ?? ""} onChange={(v) => set("contact_phone", v)} />
            </Grid2>
            <Field label="Address" value={form.shop_address ?? ""} onChange={(v) => set("shop_address", v)} />
            <Grid2>
              <Field label="WhatsApp number (country code, no +)" value={form.whatsapp_number ?? ""} onChange={(v) => set("whatsapp_number", v)} />
              <Field label="WhatsApp default message" value={form.whatsapp_message ?? ""} onChange={(v) => set("whatsapp_message", v)} />
            </Grid2>
          </Card>

          <Card title="Social links">
            <Grid2>
              <Field label="Instagram URL" value={form.instagram_url ?? ""} onChange={(v) => set("instagram_url", v)} />
              <Field label="Facebook URL" value={form.facebook_url ?? ""} onChange={(v) => set("facebook_url", v)} />
              <Field label="Twitter / X URL" value={form.twitter_url ?? ""} onChange={(v) => set("twitter_url", v)} />
              <Field label="YouTube URL" value={form.youtube_url ?? ""} onChange={(v) => set("youtube_url", v)} />
            </Grid2>
          </Card>

          <Card title="Shipping (in ₹)">
            <Grid2>
              <RupeeField label="Free shipping over" paise={form.free_shipping_threshold} onChange={(v) => set("free_shipping_threshold", v)} />
              <RupeeField label="Standard rate" paise={form.shipping_standard_rate} onChange={(v) => set("shipping_standard_rate", v)} />
              <RupeeField label="Express rate" paise={form.shipping_express_rate} onChange={(v) => set("shipping_express_rate", v)} />
            </Grid2>
            <p className="text-xs text-[#1A1A1C]/45">Enter rupee amounts (e.g. 999, 49, 99). Applied at checkout instantly.</p>
          </Card>

          <Card title="Announcement bar">
            <Field label="Text" value={form.announcement_bar_text ?? ""} onChange={(v) => set("announcement_bar_text", v)} />
            <Field label="Link (optional)" value={form.announcement_bar_link ?? ""} onChange={(v) => set("announcement_bar_link", v)} />
            <label className="mt-1 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.announcement_bar_enabled === "true"} onChange={(e) => set("announcement_bar_enabled", e.target.checked ? "true" : "false")} className="accent-[#c9a36b]" />
              Show the announcement bar
            </label>
          </Card>

          <Card title="SEO">
            <Field label="Default meta title" value={form.seo_title ?? ""} onChange={(v) => set("seo_title", v)} />
            <Textarea label="Default meta description" value={form.seo_description ?? ""} onChange={(v) => set("seo_description", v)} rows={2} />
          </Card>

          <Card title="Footer">
            <Field label="Newsletter copy" value={form.newsletter_copy ?? ""} onChange={(v) => set("newsletter_copy", v)} />
            <Field label="Copyright text" value={form.footer_copyright ?? ""} onChange={(v) => set("footer_copyright", v)} />
          </Card>

          <Card title="Advanced (JSON)">
            <Textarea label="Navigation links" value={form.nav_links ?? ""} onChange={(v) => set("nav_links", v)} placeholder='[{"href":"/collection?kind=Ring","label":"Rings"}]' rows={4} mono />
            <Textarea label="Instagram feed" value={form.instagram_feed ?? ""} onChange={(v) => set("instagram_feed", v)} placeholder='[{"image_url":"/uploads/post.jpg","caption":"New stack","post_url":"https://instagram.com/p/...","sort_order":1,"is_active":true}]' rows={4} mono />
          </Card>

          <Card title="Integrations (read-only — keys live in server env)">
            <StatusRow label="Razorpay" value={integrationStatus?.razorpayConfigured ? "Configured" : "Not configured"} />
            <StatusRow label="Razorpay Key ID" value={maskKey(integrationStatus?.razorpayKeyId ?? "") || "Not set"} />
            <StatusRow label="SMTP Email" value={integrationStatus?.smtpConfigured ? "Configured" : "Not configured"} />
            <StatusRow label="Supabase" value={integrationStatus?.supabaseConfigured ? "Configured" : "Not configured"} />
            <p className="text-xs leading-relaxed text-[#1A1A1C]/50">Razorpay webhook URL: <span className="font-mono">/api/webhooks/razorpay</span></p>
          </Card>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#0B0B0C] px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-[#c9a36b] disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      </main>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#1A1A1C]/10 bg-white p-6">
      <h3 className="mb-4 text-xs uppercase tracking-widest text-[#1A1A1C]/50">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
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

function RupeeField({ label, paise, onChange }: { label: string; paise: string | undefined; onChange: (paise: string) => void }) {
  const rupees = paise !== undefined && paise !== "" && Number.isFinite(Number(paise)) ? String(Number(paise) / 100) : ""
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label} (₹)</span>
      <input
        type="number"
        min={0}
        value={rupees}
        onChange={(e) => {
          const r = e.target.value
          onChange(r === "" ? "" : String(Math.round(Number(r) * 100)))
        }}
        className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]"
      />
    </label>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#1A1A1C]/10 py-2 text-sm">
      <span className="text-[#1A1A1C]/55">{label}</span>
      <span className="font-mono text-[11px] uppercase tracking-widest">{value}</span>
    </div>
  )
}

function maskKey(value: string) {
  if (!value) return ""
  if (value.length <= 8) return "set"
  return `${value.slice(0, 6)}...${value.slice(-4)}`
}

function Textarea({ label, value, onChange, placeholder, rows = 4, mono }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; mono?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`mt-1 w-full border border-[#1A1A1C]/15 bg-transparent p-3 text-sm outline-none focus:border-[#c9a36b] ${mono ? "font-mono text-xs" : ""}`}
      />
    </label>
  )
}
