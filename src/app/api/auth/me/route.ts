import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyCustomerSession } from "@/lib/customer-auth"

export async function GET() {
  const session = await verifyCustomerSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  return NextResponse.json({ user: session })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("customer_token")
  return NextResponse.json({ message: "Logged out" })
}
