import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { CUSTOMER_COOKIE, hasLocalPasswordHash, verifyCustomerSession } from "@/lib/customer-auth"

export async function GET() {
  const session = await verifyCustomerSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  // Return the full customer from the DB (the JWT omits phone), so the profile
  // page can load and edit phone without silently wiping it.
  const customer = await prisma.customer
    .findUnique({
      where: { id: session.id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, passwordHash: true, googleId: true },
    })
    .catch(() => null)
  const canChangePassword = hasLocalPasswordHash(customer?.passwordHash)
  const authProvider = canChangePassword ? "password" : customer?.googleId ? "google" : "external"
  return NextResponse.json({
    user: {
      ...session,
      id: customer?.id ?? session.id,
      email: customer?.email ?? session.email,
      firstName: customer?.firstName ?? session.firstName,
      lastName: customer?.lastName ?? session.lastName,
      phone: customer?.phone ?? "",
      authProvider,
      canChangePassword,
    },
  })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_COOKIE)
  cookieStore.delete("customer_token")
  return NextResponse.json({ message: "Logged out" })
}
