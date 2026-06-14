"use client"
import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { LoaderBar } from "@podium/ui/motion"
import { useAuthStore } from "@/stores/auth-store"
import { listAddresses, addAddress, deleteAddress, type Address } from "@/lib/account"

const EMPTY: Address = {
  first_name: "",
  last_name: "",
  address_1: "",
  city: "",
  postal_code: "",
  country_code: "ae",
  phone: "",
}

export function AddressesClient() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const [addresses, setAddresses] = useState<Address[] | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<Address>(EMPTY)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!token) {
      router.replace("/login?next=/account/addresses")
      return
    }
    void listAddresses(token).then(setAddresses)
  }, [token, router])

  const refresh = async () => {
    if (!token) return
    setAddresses(await listAddresses(token))
  }

  const onAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setPending(true)
    try {
      await addAddress(token, draft)
      toast.success("Address added")
      setDraft(EMPTY)
      setShowForm(false)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    } finally {
      setPending(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!token) return
    try {
      await deleteAddress(token, id)
      toast.success("Address removed")
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    }
  }

  return (
    <div className="mx-auto max-w-[960px] px-4 py-14 md:px-8 md:py-20">
      <Eyebrow className="mb-3 block">Account · Addresses</Eyebrow>
      <h1 className="mb-10 font-display tracking-tighter" style={{ fontSize: "clamp(48px, 6vw, 80px)" }}>
        Saved <em className="text-accent">addresses</em>.
      </h1>
      <Link href="/account" className="ulink mb-8 inline-block font-mono text-[11px] uppercase tracking-widest text-muted">
        ← Back to account
      </Link>

      <button
        onClick={() => setShowForm((s) => !s)}
        className="mb-6 inline-block border border-line bg-bg px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest hover:border-accent hover:text-accent"
      >
        {showForm ? "Cancel" : "+ Add address"}
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={onAdd}
            className="mb-8 overflow-hidden border border-line p-6 md:p-8"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="First name" value={draft.first_name ?? ""} onChange={(v) => setDraft({ ...draft, first_name: v })} />
              <Field label="Last name" value={draft.last_name ?? ""} onChange={(v) => setDraft({ ...draft, last_name: v })} />
              <div className="md:col-span-2">
                <Field label="Street + number" value={draft.address_1 ?? ""} onChange={(v) => setDraft({ ...draft, address_1: v })} />
              </div>
              <Field label="City" value={draft.city ?? ""} onChange={(v) => setDraft({ ...draft, city: v })} />
              <Field label="Postal code" value={draft.postal_code ?? ""} onChange={(v) => setDraft({ ...draft, postal_code: v })} />
              <Field label="Country code" value={draft.country_code ?? "ae"} onChange={(v) => setDraft({ ...draft, country_code: v.toLowerCase() })} />
              <Field label="Phone" value={draft.phone ?? ""} onChange={(v) => setDraft({ ...draft, phone: v })} type="tel" />
            </div>
            <Button type="submit" className="mt-5" disabled={pending}>
              {pending ? "Saving…" : "Save address →"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {addresses === null ? (
        <div className="my-12 mx-auto w-48"><LoaderBar /></div>
      ) : addresses.length === 0 ? (
        <div className="border border-line p-14 text-center">
          <p className="font-display text-3xl">
            <em>No saved addresses yet.</em>
          </p>
          <Eyebrow className="mt-2 block">Add one above to speed up checkout</Eyebrow>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="border border-line p-5">
              <p className="font-display text-xl">
                {a.first_name} {a.last_name}
              </p>
              <p className="mt-2 text-sm text-ink-2">{a.address_1}</p>
              <p className="text-sm text-ink-2">
                {a.city}
                {a.postal_code ? `, ${a.postal_code}` : ""}
              </p>
              <p className="text-sm text-ink-2">{a.country_code?.toUpperCase()}</p>
              {a.phone && <p className="mt-1 font-mono text-[11px] text-muted">{a.phone}</p>}
              <button
                onClick={() => a.id && void onDelete(a.id)}
                className="ulink mt-4 inline-block font-mono text-[10px] uppercase tracking-widest text-muted hover:text-accent"
              >
                Remove →
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label>
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-0 border-b border-line-2 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-ink"
      />
    </label>
  )
}
