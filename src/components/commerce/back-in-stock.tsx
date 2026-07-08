"use client"
import { useState } from "react"
import { toast } from "sonner"

export function BackInStock({ productId }: { productId: string }) {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const submit = async () => {
    if (!email) return
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
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-[12px] font-medium text-gray-600">Back in stock alerts</p>
      <div className="mt-2 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@domain.com"
          className="min-w-0 flex-1 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button onClick={submit} disabled={pending} className="bg-black px-4 py-2 text-xs uppercase tracking-widest text-white disabled:opacity-50">
          Notify
        </button>
      </div>
    </div>
  )
}
