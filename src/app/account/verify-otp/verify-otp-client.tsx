"use client"
import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"

export function VerifyOtpClient({ initialEmail }: { initialEmail: string }) {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState("")
  const [pending, setPending] = useState(false)

  const verify = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || otp.length < 4) { toast.error("Enter your email and the 6-digit code."); return }
    setPending(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: otp, type: "register" }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Invalid or expired code"); return }
      if (data.user) {
        setSession("customer_cookie", {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.firstName,
          last_name: data.user.lastName,
        })
      }
      toast.success("Email verified! Welcome to SYRA.")
      router.push("/account")
    } catch { toast.error("Network error") }
    finally { setPending(false) }
  }

  const resend = async () => {
    if (!email.trim()) { toast.error("Enter your email first."); return }
    setPending(true)
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      toast.success(data.message ?? "If that account needs verification, we've sent a new code.")
    } catch { toast.error("Network error") }
    finally { setPending(false) }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 md:py-32">
      <h1 className="mb-2 font-display text-3xl">Verify your email</h1>
      <p className="mb-8 text-sm text-muted">
        Enter the 6-digit code we emailed you to finish activating your account.
      </p>
      <form onSubmit={verify} className="space-y-5">
        {!initialEmail && (
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-accent"
              required
            />
          </label>
        )}
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter OTP"
          maxLength={6}
          className="w-full border-b border-line bg-transparent py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-accent"
        />
        <button type="submit" disabled={pending} className="w-full bg-accent py-4 text-sm font-bold uppercase tracking-wider text-bg disabled:opacity-50">
          {pending ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
      <div className="mt-6 text-center text-xs">
        <button onClick={resend} disabled={pending} className="uppercase tracking-widest text-accent disabled:opacity-50">
          Resend code
        </button>
      </div>
    </div>
  )
}
