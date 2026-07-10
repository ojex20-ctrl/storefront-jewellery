import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"

const MENU_KEY = "nav_links"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const row = await prisma.setting.findUnique({ where: { key: MENU_KEY } })
  return NextResponse.json({ links: row?.value ? JSON.parse(row.value) : [] })
}

export async function PUT(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { links } = await req.json() as { links: { href: string; label: string }[] }
  if (!Array.isArray(links)) return NextResponse.json({ error: "Links must be an array" }, { status: 400 })
  const clean = links
    .filter((link) => link && typeof link.href === "string" && typeof link.label === "string")
    .map((link) => ({ href: link.href.trim(), label: link.label.trim() }))
    .filter((link) => link.href && link.label)
  await prisma.setting.upsert({
    where: { key: MENU_KEY },
    update: { value: JSON.stringify(clean) },
    create: { key: MENU_KEY, value: JSON.stringify(clean) },
  })
  return NextResponse.json({ links: clean })
}
