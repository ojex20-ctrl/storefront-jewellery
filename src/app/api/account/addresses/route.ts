import { NextResponse } from "next/server"
import crypto from "crypto"
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
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "CustomerAddress" ("id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "fullName" TEXT NOT NULL, "phone" TEXT NOT NULL, "addressLine1" TEXT NOT NULL, "addressLine2" TEXT, "city" TEXT NOT NULL, "state" TEXT NOT NULL, "pincode" TEXT NOT NULL, "country" TEXT NOT NULL DEFAULT 'India', "isDefault" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  const rows = await prisma.$queryRawUnsafe<AddressRow[]>(`SELECT "id", "fullName", "phone", "addressLine1", "addressLine2", "city", "pincode", "country" FROM "CustomerAddress" WHERE "customerId" = ? ORDER BY "createdAt" DESC`, customerId)
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
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "CustomerAddress" ("id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "fullName" TEXT NOT NULL, "phone" TEXT NOT NULL, "addressLine1" TEXT NOT NULL, "addressLine2" TEXT, "city" TEXT NOT NULL, "state" TEXT NOT NULL, "pincode" TEXT NOT NULL, "country" TEXT NOT NULL DEFAULT 'India', "isDefault" BOOLEAN NOT NULL DEFAULT false, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await prisma.$executeRawUnsafe(
    `INSERT INTO "CustomerAddress" ("id", "customerId", "fullName", "phone", "addressLine1", "addressLine2", "city", "state", "pincode", "country") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    crypto.randomUUID(),
    customer.id,
    `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim() || "SYRA Customer",
    address.phone ?? "",
    address.address_1 ?? "",
    address.address_2 ?? null,
    address.city ?? "",
    "",
    address.postal_code ?? "",
    address.country_code ?? "India",
  )
  return NextResponse.json({ addresses: await readAddresses(customer.id) }, { status: 201 })
}

export async function DELETE(req: Request) {
  const customer = await currentCustomer()
  if (!customer) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await req.json() as { id: string }
  await prisma.$executeRawUnsafe(`DELETE FROM "CustomerAddress" WHERE "id" = ? AND "customerId" = ?`, id, customer.id)
  return NextResponse.json({ addresses: await readAddresses(customer.id) })
}
