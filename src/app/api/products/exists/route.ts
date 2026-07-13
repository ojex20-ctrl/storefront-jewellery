import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")?.trim()
  if (!id) return new Response(null, { status: 404 })

  const product = await prisma.product.findFirst({
    where: {
      published: true,
      OR: [{ id }, { slug: id }],
    },
    select: { id: true },
  })

  if (!product) return new Response(null, { status: 404 })
  return NextResponse.json({ exists: true })
}
