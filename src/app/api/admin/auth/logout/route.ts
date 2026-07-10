import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE } from "@/lib/admin-auth"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  cookieStore.delete("admin_token")
  return NextResponse.json({ ok: true })
}
