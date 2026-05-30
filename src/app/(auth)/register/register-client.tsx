"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { Magnetic, WordReveal } from "@podium/ui/motion"
import { register } from "@/lib/auth"
import { useAuthStore } from "@/stores/auth-store"

export function RegisterClient() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters")
      return
    }
    setPending(true)
    try {
      const { token, customer } = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      })
      setSession(token, customer)
      toast.success("Account created")
      router.push("/account")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-12 px-4 py-24 md:grid-cols-2 md:px-8 md:py-32">
      <div className="min-w-0">
        <Eyebrow className="mb-3.5 block">Create account</Eyebrow>
        <WordReveal
          text="A small _membership_."
          className="mb-8 font-display [overflow-wrap:anywhere]"
          style={{ fontSize: "clamp(56px, 8vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.025em" }}
        />
        <p className="text-sm leading-relaxed text-ink-2">
          Save addresses, track every dispatch from the studio, and unlock early access to new
          chapters.
        </p>
        <p className="mt-4 text-sm text-muted">
          Already a customer?{" "}
          <Link href="/login" className="ulink text-accent">
            Sign in →
          </Link>
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 self-start border border-line p-6 md:p-8"
      >
        <div className="grid grid-cols-2 gap-5">
          <Field label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
          <Field label="Last name" value={lastName} onChange={setLastName} autoComplete="family-name" />
        </div>
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={setEmail} />
        <Field
          label="Password (min 6 chars)"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={setPassword}
        />
        <Magnetic strength={0.15}>
          <Button type="submit" className="mt-2 w-full" size="lg" disabled={pending}>
            {pending ? "Creating account…" : "Create account →"}
          </Button>
        </Magnetic>
        <Link
          href="/login"
          className="text-center font-mono text-[11px] uppercase tracking-widest text-muted hover:text-accent"
        >
          Or sign in
        </Link>
      </motion.form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  autoComplete?: string
  required?: boolean
}) {
  const [focus, setFocus] = useState(false)
  return (
    <label>
      <span
        className={`mb-1.5 block font-mono text-[10px] uppercase tracking-widest transition-colors ${
          focus ? "text-accent" : "text-muted"
        }`}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        autoComplete={autoComplete}
        required={required}
        className={`w-full border-0 border-b bg-transparent py-2.5 text-sm text-ink outline-none transition-colors ${
          focus ? "border-ink" : "border-line-2"
        }`}
      />
    </label>
  )
}
