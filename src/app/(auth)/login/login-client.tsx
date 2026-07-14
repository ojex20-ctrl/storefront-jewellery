"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { GoogleButton, OrDivider } from "@/components/auth/google-button"
import { isValidEmail } from "@/lib/validation"

export function LoginClient({ googleEnabled = false, embedded = false, showRegisterLink = true }: { googleEnabled?: boolean; embedded?: boolean; showRegisterLink?: boolean }) {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) { toast.error("Enter a valid email address."); return }
    if (!password) { toast.error("Password is required."); return }
    setPending(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403 && data.needsVerification) {
          toast.message("Verify your email to continue — we've sent you a code.")
          await fetch("/api/auth/resend-otp", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          }).catch(() => {})
          router.push(`/account/verify-otp?email=${encodeURIComponent(email)}`)
          return
        }
        toast.error(data.error)
        return
      }
      setSession("customer_cookie", {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.firstName,
        last_name: data.user.lastName,
        auth_provider: data.user.authProvider ?? "password",
        can_change_password: data.user.canChangePassword ?? true,
      })
      toast.success("Welcome back!")
      router.push("/account")
    } catch { toast.error("Network error") }
    finally { setPending(false) }
  }

  return (
    <div className={embedded ? "w-full" : "mx-auto max-w-md px-4 py-24 md:py-32"}>
      <h1 className={`font-display text-3xl ${showRegisterLink ? "mb-2" : "mb-6"}`}>Sign In</h1>
      {showRegisterLink && (
        <p className="text-sm text-muted mb-8">
          New here? <Link href="/account/register" className="text-accent">Create account</Link>
        </p>
      )}
      {googleEnabled && (
        <>
          <GoogleButton label="Sign in with Google" />
          <OrDivider />
        </>
      )}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input label="Email" type="email" value={email} onChange={setEmail} required />
        <Input label="Password" type="password" value={password} onChange={setPassword} required />
        <label className="flex items-center gap-3 text-xs text-muted">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-accent" />
          <span>Remember me</span>
        </label>
        <button type="submit" disabled={pending} className="w-full bg-accent text-bg py-4 text-sm font-bold uppercase tracking-wider disabled:opacity-50 mt-2">
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </motion.form>
      <div className="mt-6 text-center text-sm text-muted">
        <Link href="/account/forgot-password" className="text-accent">Forgot password?</Link>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={type === "email" ? "email" : type === "password" ? "current-password" : undefined}
        className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  )
}
