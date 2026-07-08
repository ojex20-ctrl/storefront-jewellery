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

async function currentCustomer() {
  const session = await verifyCustomerSession()
  if (session) return session
  return null
}

function key(customerId: string) {
  return `customer_addresses:${customerId}`
}

async function readAddresses(customerId: string): Promise<Address[]> {
  const row = await prisma.setting.findUnique({ where: { key: key(customerId) } })
  if (!row?.value) return []
  try {
    const parsed = JSON.parse(row.value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeAddresses(customerId: string, addresses: Address[]) {
  await prisma.setting.upsert({
    where: { key: key(customerId) },
    update: { value: JSON.stringify(addresses) },
    create: { key: key(customerId), value: JSON.stringify(addresses) },
  })
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
  const addresses = await readAddresses(customer.id)
  const next = [{ ...address, id: address.id ?? `addr_${Date.now()}` }, ...addresses]
  await writeAddresses(customer.id, next)
  return NextResponse.json({ addresses: next }, { status: 201 })
}

export async function DELETE(req: Request) {
  const customer = await currentCustomer()
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await req.json() as { id: string }
  const addresses = (await readAddresses(customer.id)).filter((address) => address.id !== id)
  await writeAddresses(customer.id, addresses)
  return NextResponse.json({ addresses })
}
