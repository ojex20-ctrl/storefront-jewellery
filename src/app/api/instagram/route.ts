import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

type InstagramItem = {
  image_url: string
  caption?: string
  post_url: string
  sort_order?: number
  is_active?: boolean
}

export async function GET() {
  const row = await prisma.setting.findUnique({ where: { key: "instagram_feed" } }).catch(() => null)
  if (!row?.value) return NextResponse.json({ items: [] })
  try {
    const parsed = JSON.parse(row.value) as InstagramItem[]
    const items = Array.isArray(parsed)
      ? parsed
          .filter((item) => item.image_url && item.post_url && item.is_active !== false)
          .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      : []
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
