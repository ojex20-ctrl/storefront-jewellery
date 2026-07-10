import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const { email, productId } = await req.json() as { email?: string; productId?: string }
  if (!email || !productId) return NextResponse.json({ error: "Email and product required" }, { status: 400 })
  const key = `back_in_stock:${productId}:${email.toLowerCase()}`
  await prisma.setting.upsert({
    where: { key },
    update: { value: JSON.stringify({ email, productId, updatedAt: new Date().toISOString() }) },
    create: { key, value: JSON.stringify({ email, productId, createdAt: new Date().toISOString() }) },
  })
  return NextResponse.json({ ok: true })
}
