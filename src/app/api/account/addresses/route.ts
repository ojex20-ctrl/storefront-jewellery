import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sanitizeName, sanitizePhone, verifyCustomerSession } from "@/lib/customer-auth"
import { validRequestOrigin } from "@/lib/rate-limit"
import { isValidName, isValidPhone, isValidPlainText, isValidPostalCode } from "@/lib/validation"

type Address = {
  id?: string
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string | null
  city?: string
  postal_code?: string
  country_code?: string
  phone?: string
}

async function currentCustomer() {
  return verifyCustomerSession()
}

function key(customerId: string) {
  return `customer_addresses:${customerId}`
}

async function readAddresses(customerId: string): Promise<Address[]> {
  const rows = await prisma.customerAddress.findMany({ where: { customerId }, orderBy: { createdAt: "desc" } })
  if (rows.length > 0) {
    return rows.map((row) => ({
      id: row.id,
      first_name: row.fullName.split(" ")[0] ?? "",
      last_name: row.fullName.split(" ").slice(1).join(" "),
      address_1: row.addressLine1,
      address_2: row.addressLine2,
      city: row.city,
      postal_code: row.pincode,
      country_code: row.country,
      phone: row.phone,
    }))
  }
  const row = await prisma.setting.findUnique({ where: { key: key(customerId) } }).catch(() => null)
  if (!row?.value) return []
  try { return Array.isArray(JSON.parse(row.value)) ? JSON.parse(row.value) : [] } catch { return [] }
}

export async function GET() {
  const customer = await currentCustomer()
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ addresses: await readAddresses(customer.id) })
}

export async function POST(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const customer = await currentCustomer()
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const address = await req.json().catch(() => ({})) as Address
  const firstName = sanitizeName(address.first_name ?? "")
  const lastName = sanitizeName(address.last_name ?? "")
  const phone = sanitizePhone(address.phone ?? "")
  const addressLine1 = String(address.address_1 ?? "").trim().slice(0, 180)
  const addressLine2 = address.address_2 ? String(address.address_2).trim().slice(0, 180) : null
  const city = String(address.city ?? "").trim().slice(0, 80)
  const pincode = String(address.postal_code ?? "").trim().slice(0, 16)
  const country = String(address.country_code ?? "India").trim().slice(0, 80) || "India"

  if (!isValidName(firstName, { required: true })) return NextResponse.json({ error: "First name is required." }, { status: 400 })
  if (!isValidName(lastName)) return NextResponse.json({ error: "Enter a valid last name." }, { status: 400 })
  if (!isValidPlainText(addressLine1, { required: true, min: 5, max: 180 })) return NextResponse.json({ error: "Enter a complete street address." }, { status: 400 })
  if (!isValidPlainText(city, { required: true, min: 2, max: 80 })) return NextResponse.json({ error: "Enter a valid city." }, { status: 400 })
  if (!isValidPostalCode(pincode, { required: true })) return NextResponse.json({ error: "Enter a valid postal code." }, { status: 400 })
  if (!isValidPhone(phone, { required: true })) return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 })

  await prisma.customerAddress.create({
    data: { customerId: customer.id, fullName: `${firstName} ${lastName}`.trim(), phone, addressLine1, addressLine2, city, state: "", pincode, country },
  })
  return NextResponse.json({ addresses: await readAddresses(customer.id) }, { status: 201 })
}

export async function DELETE(req: Request) {
  if (!validRequestOrigin(req)) return NextResponse.json({ error: "Invalid request" }, { status: 403 })
  const customer = await currentCustomer()
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await req.json().catch(() => ({})) as { id?: string }
  if (!id) return NextResponse.json({ error: "Address id is required." }, { status: 400 })
  await prisma.customerAddress.deleteMany({ where: { id, customerId: customer.id } })
  return NextResponse.json({ addresses: await readAddresses(customer.id) })
}
