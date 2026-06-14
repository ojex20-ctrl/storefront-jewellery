import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminPassword, createAdminToken } from "@/lib/admin-auth"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }
  const user = await verifyAdminPassword(email, password)
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
  const token = createAdminToken(user)
  const cookieStore = await cookies()
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
  return NextResponse.json({ user })
}
