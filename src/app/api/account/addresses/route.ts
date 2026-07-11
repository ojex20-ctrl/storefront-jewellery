import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

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

type AddressRow = {
  id: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  pincode: string
  country: string
}

async function currentCustomer() {
  const session = await verifyCustomerSession()
  if (session) return session
  return null
}

function key(customerId: string) {
  return `customer_addresses:${customerId}`
}

async function readAddresses(customerId: string): Promise<Address[]> {
  const rows = await prisma.customerAddress.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  })
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
  const customer = await currentCustomer()
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const address = await req.json() as Address
  await prisma.customerAddress.create({
    data: {
      customerId: customer.id,
      fullName: `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim() || "SYRA Customer",
      phone: address.phone ?? "",
      addressLine1: address.address_1 ?? "",
      addressLine2: address.address_2 ?? null,
      city: address.city ?? "",
      state: "",
      pincode: address.postal_code ?? "",
      country: address.country_code ?? "India",
    },
  })
  return NextResponse.json({ addresses: await readAddresses(customer.id) }, { status: 201 })
}

export async function DELETE(req: Request) {
  const customer = await currentCustomer()
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await req.json() as { id: string }
  await prisma.customerAddress.deleteMany({ where: { id, customerId: customer.id } })
  return NextResponse.json({ addresses: await readAddresses(customer.id) })
}
