"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Eyebrow } from "@podium/ui/primitives"

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const token = params.get("token") ?? ""
  const [state, setState] = useState<"checking" | "ok" | "error">("checking")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    if (!token) {
      setState("error")
      setMessage("Verification link is missing.")
      return
    }
    void fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error ?? "Verification failed")
        setState("ok")
        setMessage(data.message ?? "Email verified.")
      })
      .catch((err) => {
        setState("error")
        setMessage(err instanceof Error ? err.message : "Verification failed.")
      })
  }, [token])

  return (
    <div className="mx-auto max-w-[640px] px-4 py-32 text-center md:px-8">
      <Eyebrow>{state === "checking" ? "Checking" : state === "ok" ? "Verified" : "Link expired"}</Eyebrow>
      <p className="mt-4 font-display text-4xl"><em>{message}</em></p>
      <Link href={state === "ok" ? "/account/login" : "/account/forgot-password"} className="ulink mt-8 inline-block font-mono text-[11px] uppercase tracking-widest text-accent">
        {state === "ok" ? "Sign in" : "Get help"}
      </Link>
    </div>
  )
}
