import { AuthAccessClient } from "@/app/(auth)/auth-access-client"
import { isGoogleConfigured } from "@/lib/google-auth"

export const metadata = { title: "Account access" }

export default function AccountRegisterPage() {
  return <AuthAccessClient googleEnabled={isGoogleConfigured()} />
}
