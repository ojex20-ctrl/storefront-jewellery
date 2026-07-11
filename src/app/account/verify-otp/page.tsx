import { Suspense } from "react"
import { VerifyOtpClient } from "./verify-otp-client"

export const metadata = { title: "Verify your email" }

export default function VerifyOtpPage({ searchParams }: { searchParams: { email?: string } }) {
  return (
    <Suspense>
      <VerifyOtpClient initialEmail={searchParams.email ?? ""} />
    </Suspense>
  )
}
