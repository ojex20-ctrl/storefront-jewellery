import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

/**
 * ONE-TIME SETUP ENDPOINT
 * POST /api/admin/setup
 * Body: { secret: "SETUP_SECRET", email: "...", password: "...", name: "..." }
 *
 * Creates or updates the admin user in the production database.
 * Protected by a secret key set in the SETUP_SECRET env variable.
 * Safe to call multiple times (uses upsert).
 */
export async function POST(req: Request) {
  try {
    // The endpoint is disabled unless a setup secret is explicitly configured.
    // No fallback default — a known default would let anyone create a superadmin.
    const expectedSecret = process.env.SETUP_SECRET
    if (!expectedSecret) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { secret, email, password, name } = await req.json()

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash, name: name ?? "Admin", role: "superadmin" },
      create: {
        email,
        passwordHash,
        name: name ?? "Admin",
        role: "superadmin",
      },
    })

    return NextResponse.json({
      success: true,
      message: `Admin user ${user.email} created/updated successfully`,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (err) {
    console.error("[setup] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
