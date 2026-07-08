import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyCustomerSession } from "@/lib/customer-auth"

function key(customerId: string) {
  return `customer_wishlist:${customerId}`
}

async function readWishlist(customerId: string): Promise<string[]> {
  const row = await prisma.setting.findUnique({ where: { key: key(customerId) } })
  if (!row?.value) return []
  try {
    const parsed = JSON.parse(row.value)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

async function writeWishlist(customerId: string, ids: string[]) {
  await prisma.setting.upsert({
    where: { key: key(customerId) },
    update: { value: JSON.stringify(ids) },
    create: { key: key(customerId), value: JSON.stringify(ids) },
  })
}

export async function GET() {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ ids: await readWishlist(session.id) })
}

export async function PUT(req: Request) {
  const session = await verifyCustomerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { ids } = await req.json() as { ids: string[] }
  const clean = Array.from(new Set((ids ?? []).filter((id) => typeof id === "string")))
  await writeWishlist(session.id, clean)
  return NextResponse.json({ ids: clean })
}
