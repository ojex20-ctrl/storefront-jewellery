import { RegisterClient } from "@/app/(auth)/register/register-client"
import { isGoogleConfigured } from "@/lib/google-auth"

export const metadata = { title: "Create account" }

export default function AccountRegisterPage() {
  return <RegisterClient googleEnabled={isGoogleConfigured()} />
}
