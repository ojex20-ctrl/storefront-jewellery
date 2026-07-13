import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminSession } from "@/lib/admin-auth"
import { hasPermission } from "@/lib/rbac"
import { isSecretSettingKey } from "@/lib/payment-settings"

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "settings:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const settings = await prisma.setting.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = isSecretSettingKey(s.key) ? "" : s.value
  return NextResponse.json({ settings: map })
}

export async function PUT(req: Request) {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasPermission(session, "settings:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const data = await req.json() as Record<string, unknown>
  for (const [key, rawValue] of Object.entries(data)) {
    const value = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue ?? "")
    if (isSecretSettingKey(key) && value.trim() === "") continue
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
  }
  return NextResponse.json({ ok: true })
}
