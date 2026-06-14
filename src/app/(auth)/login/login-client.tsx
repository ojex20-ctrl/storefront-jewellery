"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { Magnetic, WordReveal } from "@podium/ui/motion"
import { login } from "@/lib/auth"
import { useAuthStore } from "@/stores/auth-store"

export function LoginClient() {
  const router = useRouter()
  const params = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [pending, setPending] = useState(false)

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault()
    if (!phone) return
    setPending(true)
    // Simulate WhatsApp API call
    setTimeout(() => {
      setStep("otp")
      setPending(false)
      toast.success("OTP sent to your WhatsApp")
    }, 1500)
  }

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code")
      return
    }
    setPending(true)
    // Simulate verification and JWT issuance
    setTimeout(() => {
      const mockCustomer = { email: `${phone}@syra.com`, first_name: "Customer" }
      setSession("mock_jwt_token", mockCustomer as any)
      toast.success("Signed in successfully")
      router.push(params.get("next") ?? "/account")
      setPending(false)
    }, 1500)
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-12"
      >
        <div className="text-center">
          <h1 className="font-display text-5xl tracking-tight mb-4">SYRA</h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {step === "phone" ? "Secure WhatsApp Login" : "Enter Verification Code"}
          </p>
        </div>

        <form onSubmit={step === "phone" ? handleSendOTP : handleVerifyOTP} className="space-y-10">
          {step === "phone" ? (
            <Field
              label="Phone Number"
              type="tel"
              placeholder="+91 00000 00000"
              value={phone}
              onChange={setPhone}
              required
            />
          ) : (
            <Field
              label="6-Digit Code"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={setOtp}
              required
              maxLength={6}
            />
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-ink text-bg py-5 font-mono text-[11px] uppercase tracking-[0.3em] hover:bg-accent transition-all duration-500 disabled:opacity-50"
          >
            {pending ? "Processing..." : step === "phone" ? "Send OTP" : "Verify Code"}
          </button>
        </form>

        {step === "otp" && (
          <button 
            onClick={() => setStep("phone")}
            className="w-full text-center font-mono text-[10px] uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            Back to phone entry
          </button>
        )}

        <div className="pt-12 border-t border-line text-center">
          <p className="text-xs text-muted leading-relaxed max-w-[280px] mx-auto">
            By signing in, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  maxLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  maxLength?: number
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full bg-transparent border-b border-line py-3 text-lg outline-none focus:border-accent transition-colors placeholder:text-muted/30"
      />
    </label>
  )
}
