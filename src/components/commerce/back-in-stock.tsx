"use client"
import { useState } from "react"
import { toast } from "sonner"
import { isValidEmail } from "@/lib/validation"

export function BackInStock({ productId }: { productId: string }) {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const submit = async () => {
    if (!isValidEmail(email)) { toast.error("Enter a valid email."); return }
    setPending(true)
    const resp = await fetch("/api/back-in-stock", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, productId }),
    })
    setPending(false)
    if (resp.ok) {
      toast.success("Back-in-stock alert saved")
      setEmail("")
    } else {
      toast.error("Could not save alert")
    }
  }
  return (
    <div className="rounded-lg border border-line bg-paper p-4">
      <p className="text-[12px] font-medium text-muted">Back in stock alerts</p>
      <div className="mt-2 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@domain.com"
          className="min-w-0 flex-1 border border-line bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-accent"
        />
        <button onClick={submit} disabled={pending} className="bg-ink px-4 py-2 text-xs uppercase tracking-widest text-bg transition-colors hover:bg-accent disabled:opacity-50">
          Notify
        </button>
      </div>
    </div>
  )
}
