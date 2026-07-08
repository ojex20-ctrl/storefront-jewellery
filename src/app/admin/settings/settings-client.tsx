"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { Save } from "lucide-react"

type IntegrationStatus = {
  razorpayConfigured: boolean
  razorpayKeyId: string
  smtpConfigured: boolean
  supabaseConfigured: boolean
}

export function SettingsClient({
  settings,
  integrationStatus,
}: {
  settings: Record<string, string>
  integrationStatus?: IntegrationStatus
}) {
  const router = useRouter()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
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
          <Link href="/admin/settings" className="block px-3 py-2.5 text-xs uppercase tracking-widest text-white bg-white/10 rounded">Settings</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <h1 className="font-display text-4xl tracking-tight mb-8">Store Settings</h1>

        <form onSubmit={onSubmit} className="space-y-8 max-w-2xl">
          <Card title="Brand">
            <Field label="Brand Name" value={form.brand_name ?? ""} onChange={(v) => set("brand_name", v)} />
            <Field label="Tagline" value={form.tagline ?? ""} onChange={(v) => set("tagline", v)} />
          </Card>

          <Card title="Contact">
            <Field label="Email" value={form.contact_email ?? ""} onChange={(v) => set("contact_email", v)} />
            <Field label="Phone" value={form.contact_phone ?? ""} onChange={(v) => set("contact_phone", v)} />
            <Field label="WhatsApp Number (with country code, no +)" value={form.whatsapp_number ?? ""} onChange={(v) => set("whatsapp_number", v)} />
            <Field label="WhatsApp Default Message" value={form.whatsapp_message ?? ""} onChange={(v) => set("whatsapp_message", v)} />
          </Card>

          <Card title="Shipping">
            <Field label="Free Shipping Threshold (paise, ₹999 = 99900)" value={form.free_shipping_threshold ?? ""} onChange={(v) => set("free_shipping_threshold", v)} />
          </Card>

          <Card title="Social">
            <Field label="Instagram URL" value={form.instagram_url ?? ""} onChange={(v) => set("instagram_url", v)} />
            <Textarea
              label="Manual Instagram Feed JSON"
              value={form.instagram_feed ?? ""}
              onChange={(v) => set("instagram_feed", v)}
              placeholder='[{"image_url":"/uploads/post.jpg","caption":"New stack","post_url":"https://instagram.com/p/...","sort_order":1,"is_active":true}]'
            />
          </Card>

          <Card title="Integrations">
            <StatusRow label="Razorpay" value={integrationStatus?.razorpayConfigured ? "Configured" : "Not configured"} />
            <StatusRow label="Razorpay Key ID" value={maskKey(integrationStatus?.razorpayKeyId ?? "") || "Not set"} />
            <StatusRow label="Supabase" value={integrationStatus?.supabaseConfigured ? "Configured" : "Not configured"} />
            <StatusRow label="SMTP Email" value={integrationStatus?.smtpConfigured ? "Configured" : "Not configured"} />
            <p className="text-xs leading-relaxed text-[#1A1A1C]/50">
              Webhook URL: /api/webhooks/razorpay. Secret keys stay in environment variables only.
            </p>
          </Card>

          <Card title="Menu Manager">
            <Textarea
              label="Navigation Links JSON"
              value={form.nav_links ?? ""}
              onChange={(v) => set("nav_links", v)}
              placeholder='[{"href":"/collection?kind=Ring","label":"Rings"}]'
            />
          </Card>

          <Card title="Announcement Bar">
            <Field label="Text" value={form.announcement_bar_text ?? ""} onChange={(v) => set("announcement_bar_text", v)} />
            <Field label="Link" value={form.announcement_bar_link ?? ""} onChange={(v) => set("announcement_bar_link", v)} />
            <label className="flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" checked={form.announcement_bar_enabled === "true"} onChange={(e) => set("announcement_bar_enabled", e.target.checked ? "true" : "false")} className="accent-[#c9a36b]" />
              Enabled
            </label>
          </Card>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#0B0B0C] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#c9a36b] disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving…" : "Save Settings"}
          </button>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border-b border-[#1A1A1C]/15 bg-transparent py-2 text-sm outline-none focus:border-[#c9a36b]" />
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

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-[#1A1A1C]/50">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="mt-1 w-full border border-[#1A1A1C]/15 bg-transparent p-3 font-mono text-xs outline-none focus:border-[#c9a36b]"
      />
    </label>
  )
}
