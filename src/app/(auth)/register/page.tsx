import { AuthAccessClient } from "../auth-access-client"
import { isGoogleConfigured } from "@/lib/google-auth"

export const metadata = { title: "Sign in or create account" }

export default function RegisterPage() {
  return <AuthAccessClient googleEnabled={isGoogleConfigured()} />
}
