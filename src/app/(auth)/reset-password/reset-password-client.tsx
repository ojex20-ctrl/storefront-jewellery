"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { Magnetic, WordReveal } from "@podium/ui/motion"
import { performPasswordReset } from "@/lib/account"

export function ResetPasswordClient() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error("Passwords don't match")
      return
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      toast.error("Use 8+ characters with uppercase, lowercase, and a number")
      return
    }
    setPending(true)
    try {
      await performPasswordReset(token, password)
      toast.success("Password updated. Sign in with the new one.")
      router.push("/account/login")
    } catch {
      toast.error("Reset link expired or invalid. Request a new one.")
    } finally {
      setPending(false)
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-32 text-center md:px-8">
        <Eyebrow>Invalid link</Eyebrow>
        <p className="mt-3 font-display text-4xl">
          <em>Reset link is missing or expired.</em>
        </p>
        <Link href="/account/forgot-password" className="ulink mt-8 inline-block font-mono text-[11px] uppercase tracking-widest text-accent">
          Request a new link →
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-12 px-4 py-24 md:grid-cols-2 md:px-8 md:py-32">
      <div className="min-w-0">
        <Eyebrow className="mb-3.5 block">New password</Eyebrow>
        <WordReveal
          text="Set a _new one_."
          className="mb-8 font-display [overflow-wrap:anywhere]"
          style={{ fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 0.95, letterSpacing: "-0.025em" }}
        />
        <p className="text-sm leading-relaxed text-ink-2">
          Six characters or more. Use something you&apos;ll actually remember.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        onSubmit={onSubmit}
        className="flex flex-col gap-5 self-start border border-line p-6 md:p-8"
      >
        <Field label="New password" type="password" value={password} onChange={setPassword} />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} />
        <Magnetic strength={0.15}>
          <Button type="submit" className="mt-2 w-full" size="lg" disabled={pending}>
            {pending ? "Updating…" : "Set new password →"}
          </Button>
        </Magnetic>
      </motion.form>
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
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        autoComplete="new-password"
        className={`w-full border-0 border-b bg-transparent py-2.5 text-sm text-ink outline-none transition-colors ${
          focus ? "border-ink" : "border-line-2"
        }`}
      />
    </label>
  )
}
