import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sanitizeName, sanitizePhone, verifyCustomerSession } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isValidName, isValidPhone } from "@/lib/validation"

export async function PUT(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const firstName = sanitizeName(body.first_name ?? "")
  const lastName = sanitizeName(body.last_name ?? "")
  const phone = sanitizePhone(body.phone ?? "")

  if (!isValidName(firstName, { required: true })) return NextResponse.json({ error: "First name is required." }, { status: 400 })
  if (!isValidName(lastName)) return NextResponse.json({ error: "Enter a valid last name." }, { status: 400 })
  if (!isValidPhone(phone)) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })

  const customer = await prisma.customer.update({ where: { id: session.id }, data: { firstName, lastName, phone } })
  return NextResponse.json({ customer: { id: customer.id, email: customer.email, first_name: customer.firstName, last_name: customer.lastName, phone: customer.phone } })
}
