import { LoginClient } from "./login-client"
import { isGoogleConfigured } from "@/lib/google-auth"

export const metadata = { title: "Sign in" }

export default function LoginPage() {
  return <LoginClient googleEnabled={isGoogleConfigured()} />
}
