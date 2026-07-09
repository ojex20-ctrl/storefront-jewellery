import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sanitizeName, sanitizePhone, verifyCustomerSession } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"

export async function PUT(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const customer = await prisma.customer.update({
    where: { id: session.id },
    data: {
      firstName: sanitizeName(body.first_name ?? ""),
      lastName: sanitizeName(body.last_name ?? ""),
      phone: sanitizePhone(body.phone ?? ""),
    },
  })
  return NextResponse.json({
    customer: {
      id: customer.id,
      email: customer.email,
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone: customer.phone,
    },
  })
}
