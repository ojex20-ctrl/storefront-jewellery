import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isValidPlainText, isValidUrlOrPath } from "@/lib/validation"

const MENU_KEY = "nav_links"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const row = await prisma.setting.findUnique({ where: { key: MENU_KEY } })
  try {
    return NextResponse.json({ links: row?.value ? JSON.parse(row.value) : [] })
  } catch {
    return NextResponse.json({ links: [] })
  }
}

export async function PUT(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "content:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { links } = await req.json().catch(() => ({})) as { links?: { href: string; label: string }[] }
  if (!Array.isArray(links) || links.length > 30) return NextResponse.json({ error: "Links must be an array" }, { status: 400 })
  const clean = links
    .filter((link) => link && typeof link.href === "string" && typeof link.label === "string")
    .map((link) => ({ href: link.href.trim().slice(0, 500), label: link.label.trim().slice(0, 80) }))
    .filter((link) => isValidUrlOrPath(link.href) && isValidPlainText(link.label, { required: true, max: 80 }))
  await prisma.setting.upsert({
    where: { key: MENU_KEY },
    update: { value: JSON.stringify(clean) },
    create: { key: MENU_KEY, value: JSON.stringify(clean) },
  })
  return NextResponse.json({ links: clean })
}
