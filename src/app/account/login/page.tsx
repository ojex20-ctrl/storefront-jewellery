import { LoginClient } from "@/app/(auth)/login/login-client"
import { isGoogleConfigured } from "@/lib/google-auth"

export const metadata = { title: "Account login" }

export default function AccountLoginPage() {
  return <LoginClient googleEnabled={isGoogleConfigured()} />
}
