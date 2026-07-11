"use client"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Reveal } from "@podium/ui/motion"
import { Eyebrow, Button } from "@podium/ui/primitives"

export function ContactForm({ email, phone }: { email: string; phone: string }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !/.+@.+\..+/.test(form.email) || !form.message.trim()) {
      toast.error("Please add your name, a valid email, and a message.")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, type: "contact" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not send message")
      toast.success(data.message ?? "Thanks — we'll be in touch soon.")
      setForm({ name: "", email: "", message: "" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 md:px-12 md:py-32">
      <Reveal>
        <Eyebrow className="mb-6 text-accent">Connect</Eyebrow>
        <h1 className="mb-12 font-display text-5xl leading-tight tracking-tight md:text-7xl">We&apos;re here to help.</h1>

        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-display text-2xl">Get in touch</h2>
            <p className="mb-8 text-ink-2">
              Have a question about our collections or your order? Reach out to our concierge team.
            </p>
            <div className="grid gap-6">
              <div>
                <h3 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted">Email</h3>
                <p className="font-display text-xl">{email}</p>
              </div>
              <div>
                <h3 className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted">WhatsApp</h3>
                <p className="font-display text-xl">{phone}</p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-6 border border-line bg-bg-2 p-8">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="Your email" />
            <div className="grid gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="min-h-[100px] border-b border-line bg-transparent py-2 outline-none focus:border-accent"
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" className="mt-4" disabled={sending}>
              {sending ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </div>
      </Reveal>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div className="grid gap-2">
      <label className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="border-b border-line bg-transparent py-2 outline-none focus:border-accent" />
    </div>
  )
}
