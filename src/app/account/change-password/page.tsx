"use client"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirm) return toast.error("Passwords do not match")
    setPending(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Could not update password")
      toast.success("Password updated")
      setCurrentPassword("")
      setNewPassword("")
      setConfirm("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 md:py-32">
      <Eyebrow className="mb-3 block">Account Security</Eyebrow>
      <h1 className="mb-8 font-display text-4xl">Change password</h1>
      <form onSubmit={onSubmit} className="space-y-5 border border-line p-6">
        <Field label="Current password" value={currentPassword} onChange={setCurrentPassword} />
        <Field label="New password" value={newPassword} onChange={setNewPassword} />
        <Field label="Confirm new password" value={confirm} onChange={setConfirm} />
        <Button type="submit" className="w-full" disabled={pending}>{pending ? "Updating..." : "Update password"}</Button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input type="password" required value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-b border-line bg-transparent py-2.5 text-sm outline-none focus:border-accent" />
    </label>
  )
}
