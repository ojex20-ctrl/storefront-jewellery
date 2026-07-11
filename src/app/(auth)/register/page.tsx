import { RegisterClient } from "./register-client"
import { isGoogleConfigured } from "@/lib/google-auth"

export const metadata = { title: "Create account" }

export default function RegisterPage() {
  return <RegisterClient googleEnabled={isGoogleConfigured()} />
}
