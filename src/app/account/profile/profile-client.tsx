"use client"
import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { Magnetic } from "@podium/ui/motion"
import { useAuthStore } from "@/stores/auth-store"
import { updateProfile } from "@/lib/account"
import { refreshCustomer } from "@/lib/auth"
import { isValidName, isValidPhone } from "@/lib/validation"

export function ProfileClient() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const customer = useAuthStore((s) => s.customer)
  const setSession = useAuthStore((s) => s.setSession)
  const setCustomer = useAuthStore((s) => s.setCustomer)
  const clear = useAuthStore((s) => s.clear)
  const [first, setFirst] = useState("")
  const [last, setLast] = useState("")
  const [phone, setPhone] = useState("")
  const [pending, setPending] = useState(false)

  // Always load the freshest customer from the DB on mount so Phone is
  // populated (the JWT/store omit it) — otherwise saving could wipe it.
  useEffect(() => {
    void refreshCustomer("customer_cookie").then((fresh) => {
      if (!fresh) { clear(); router.replace("/account/login?next=/account/profile"); return }
      setSession("customer_cookie", fresh)
      setFirst(fresh.first_name ?? "")
      setLast(fresh.last_name ?? "")
      setPhone(fresh.phone ?? "")
    })
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!isValidName(first, { required: true })) { toast.error("First name is required."); return }
    if (!isValidName(last)) { toast.error("Enter a valid last name."); return }
    if (!isValidPhone(phone)) { toast.error("Enter a valid phone number."); return }
    setPending(true)
    try {
      const r = await updateProfile(token, { first_name: first.trim(), last_name: last.trim(), phone: phone.trim() })
      setCustomer(r.customer)
      toast.success("Profile updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-[760px] px-4 py-14 md:px-8 md:py-20">
      <Eyebrow className="mb-3 block">Account · Profile</Eyebrow>
      <h1 className="mb-10 font-display tracking-tighter" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
        Your <em className="text-accent">profile</em>.
      </h1>
      <Link href="/account" className="ulink mb-8 inline-block font-mono text-[11px] uppercase tracking-widest text-muted">
        ← Back to account
      </Link>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 border border-line p-6 md:grid-cols-2 md:p-8">
        <Field label="First name" value={first} onChange={setFirst} />
        <Field label="Last name" value={last} onChange={setLast} />
        <div className="md:col-span-2">
          <Field label="Email" value={customer?.email ?? ""} onChange={() => {}} disabled />
        </div>
        <div className="md:col-span-2">
          <Field label="Phone" value={phone} onChange={setPhone} type="tel" />
        </div>
        <div className="md:col-span-2">
          <Magnetic strength={0.15}>
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? "Saving…" : "Save profile →"}
            </Button>
          </Magnetic>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        Want to change your password?{" "}
        <Link href="/account/change-password" className="ulink text-accent">
          Send me a reset link →
        </Link>
      </p>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  disabled?: boolean
}) {
  return (
    <label>
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-line-2 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-ink disabled:text-muted"
      />
    </label>
  )
}
