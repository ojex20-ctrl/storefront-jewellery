"use client"
import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Login failed")
        return
      }
      router.push("/admin")
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0B0C]">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center">
          <h1 className="font-display text-3xl text-white tracking-tight">SYRA Admin</h1>
          <p className="mt-2 text-sm text-white/50">Sign in to manage your store</p>
        </div>
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-white/40">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border-b border-white/20 bg-transparent py-2 text-white outline-none focus:border-[#c9a36b]"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-white/40">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border-b border-white/20 bg-transparent py-2 text-white outline-none focus:border-[#c9a36b]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c9a36b] py-3 text-xs font-bold uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  )
}
