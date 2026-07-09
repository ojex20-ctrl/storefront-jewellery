import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE } from "@/lib/admin-auth"

async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  cookieStore.delete("admin_token")
}

export async function GET(req: Request) {
  await clearAdminSession()
  return NextResponse.redirect(new URL("/admin/login", req.url))
}

export async function POST() {
  await clearAdminSession()
  return NextResponse.json({ ok: true })
}
