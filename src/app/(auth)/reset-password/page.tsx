import { Suspense } from "react"
import { ResetPasswordClient } from "./reset-password-client"
export const metadata = { title: "Set new password" }
export default function Page() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  )
}
