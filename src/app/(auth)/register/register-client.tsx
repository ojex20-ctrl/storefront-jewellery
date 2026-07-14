"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { GoogleButton, OrDivider } from "@/components/auth/google-button"
import { isStrongPassword, isValidEmail, isValidName, isValidOtp, isValidPhone } from "@/lib/validation"

export function RegisterClient({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const [step, setStep] = useState<"form" | "otp">("form")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [otp, setOtp] = useState("")
  const [pending, setPending] = useState(false)

  const validateRegistration = () => {
    if (!isValidName(firstName, { required: true })) return "Enter your first name."
    if (!isValidName(lastName, { required: true })) return "Enter your last name."
    if (!isValidEmail(email)) return "Enter a valid email address."
    if (!isValidPhone(phone, { required: true })) return "Enter a valid mobile number."
    if (!isStrongPassword(password)) return "Password must be 8+ characters with uppercase, lowercase, and a number."
    if (password !== confirmPassword) return "Passwords don't match."
    if (!acceptTerms) return "Please accept the terms and privacy policy."
    return null
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validateRegistration()
    if (validationError) { toast.error(validationError); return }
    setPending(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, password, confirmPassword, acceptTerms }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success(data.message ?? "Verification code sent")
      setStep("otp")
    } catch { toast.error("Network error") }
    finally { setPending(false) }
  }

  const resendCode = async () => {
    setPending(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, password, confirmPassword, acceptTerms }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success("New code sent")
    } catch { toast.error("Network error") }
    finally { setPending(false) }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidOtp(otp)) { toast.error("Enter the 6-digit verification code."); return }
    setPending(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code: otp, type: "register" }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      // verify-otp sets the httpOnly cookie AND returns the user — sync the
      // client store so the nav/greeting reflect the logged-in state at once.
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

  if (step === "otp") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 md:py-32">
        <h1 className="font-display text-3xl mb-4">Verify Email</h1>
        <p className="text-sm text-muted mb-8">Enter the 6-digit code sent to <strong>{email}</strong></p>
        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="w-full border-b border-line bg-transparent py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-accent"
          />
          <button type="submit" disabled={pending} className="w-full bg-accent text-bg py-4 text-sm font-bold uppercase tracking-wider disabled:opacity-50">
            {pending ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
        <div className="mt-6 flex items-center justify-between text-xs text-muted">
          <button onClick={resendCode} disabled={pending} className="uppercase tracking-widest text-accent disabled:opacity-50">
            Resend code
          </button>
          <button onClick={() => setStep("form")} className="uppercase tracking-widest underline">
            Change email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 md:py-32">
      <h1 className="font-display text-3xl mb-2">Create Account</h1>
      <p className="text-sm text-muted mb-8">
        Already have an account? <Link href="/account/login" className="text-accent">Sign in</Link>
      </p>
      {googleEnabled && (
        <>
          <GoogleButton label="Sign up with Google" />
          <OrDivider />
        </>
      )}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleRegister}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={firstName} onChange={setFirstName} required />
          <Input label="Last Name" value={lastName} onChange={setLastName} required />
        </div>
        <Input label="Email" type="email" value={email} onChange={setEmail} required />
        <Input label="Mobile Number" type="tel" value={phone} onChange={setPhone} required />
        <Input label="Password" type="password" value={password} onChange={setPassword} required />
        <Input label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
        <label className="flex items-start gap-3 text-xs text-muted">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
            className="mt-1 accent-accent"
          />
          <span>I accept the <Link href="/terms" className="text-accent">Terms</Link> and <Link href="/privacy" className="text-accent">Privacy Policy</Link>.</span>
        </label>
        <button type="submit" disabled={pending} className="w-full bg-accent text-bg py-4 text-sm font-bold uppercase tracking-wider disabled:opacity-50 mt-2">
          {pending ? "Creating..." : "Create Account"}
        </button>
      </motion.form>
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
        autoComplete={type === "email" ? "email" : type === "password" ? "new-password" : type === "tel" ? "tel" : undefined}
        inputMode={type === "tel" ? "tel" : undefined}
        className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  )
}
