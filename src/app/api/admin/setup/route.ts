import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { isStrongPassword, isValidEmail, normalizeEmailAddress } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const expectedSecret = process.env.SETUP_SECRET
    if (!expectedSecret) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const { secret, email: rawEmail, password, name } = await req.json().catch(() => ({}))
    const email = normalizeEmailAddress(rawEmail)
    if (!secret || secret !== expectedSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!isValidEmail(email)) return NextResponse.json({ error: "Enter a valid admin email." }, { status: 400 })
    if (!isStrongPassword(password)) return NextResponse.json({ error: "Password must be 8+ characters with uppercase, lowercase, and a number." }, { status: 400 })

    const passwordHash = await bcrypt.hash(String(password), 12)
    const user = await prisma.adminUser.upsert({ where: { email }, update: { passwordHash, name: String(name ?? "Admin").trim().slice(0, 80) || "Admin", role: "superadmin" }, create: { email, passwordHash, name: String(name ?? "Admin").trim().slice(0, 80) || "Admin", role: "superadmin" } })
    return NextResponse.json({ success: true, message: `Admin user ${user.email} created/updated successfully`, email: user.email, name: user.name, role: user.role })
  } catch (err) {
    console.error("[setup] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
