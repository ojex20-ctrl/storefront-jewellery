"use client"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Button, Eyebrow } from "@podium/ui/primitives"
import { Magnetic, WordReveal } from "@podium/ui/motion"
import { requestPasswordReset } from "@/lib/account"

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setPending(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
      toast.success("Check your inbox for a reset link.")
    } catch {
      // Medusa returns 200 even on unknown email; only network errors land here.
      toast.error("Couldn't send reset email. Try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-12 px-4 py-24 md:grid-cols-2 md:px-8 md:py-32">
      <div className="min-w-0">
        <Eyebrow className="mb-3.5 block">Reset password</Eyebrow>
        <WordReveal
          text="Forgot? _It happens_."
          className="mb-8 font-display [overflow-wrap:anywhere]"
          style={{ fontSize: "clamp(48px, 7vw, 88px)", lineHeight: 0.95, letterSpacing: "-0.025em" }}
        />
        <p className="text-sm leading-relaxed text-ink-2">
          Drop your email — we&apos;ll send a reset link. Link expires in 30 minutes.
        </p>
        <p className="mt-4 text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="ulink text-accent">
            Sign in →
          </Link>
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        onSubmit={onSubmit}
        className="flex flex-col gap-5 self-start border border-line p-6 md:p-8"
      >
        {sent ? (
          <div className="text-center">
            <Eyebrow className="mb-2 block">Sent</Eyebrow>
            <p className="font-display text-3xl">
              <em>Check your inbox.</em>
            </p>
            <p className="mt-3 text-sm text-muted">
              If the email matches an account, the link arrives within a minute.
            </p>
            <Link href="/login" className="ulink mt-6 inline-block font-mono text-[11px] uppercase tracking-widest text-accent">
              Back to sign in →
            </Link>
          </div>
        ) : (
          <>
            <label>
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b border-line-2 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-ink"
              />
            </label>
            <Magnetic strength={0.15}>
              <Button type="submit" className="mt-2 w-full" size="lg" disabled={pending}>
                {pending ? "Sending…" : "Send reset link →"}
              </Button>
            </Magnetic>
          </>
        )}
      </motion.form>
    </div>
  )
}
