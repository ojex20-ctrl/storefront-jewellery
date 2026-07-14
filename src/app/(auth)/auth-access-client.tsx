"use client"

import { LoginClient } from "./login/login-client"
import { RegisterClient } from "./register/register-client"

export function AuthAccessClient({ googleEnabled = false }: { googleEnabled?: boolean }) {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-16 md:px-8 md:py-24">
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Account</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight md:text-6xl">Sign in or create account</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <section className="border border-line bg-paper p-5 md:p-8">
          <LoginClient googleEnabled={googleEnabled} embedded showRegisterLink={false} />
        </section>
        <section className="border border-line bg-bg-2 p-5 md:p-8">
          <RegisterClient googleEnabled={googleEnabled} embedded showLoginLink={false} />
        </section>
      </div>
    </div>
  )
}
