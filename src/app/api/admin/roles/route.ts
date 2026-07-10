import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/admin-auth"
import { permissionsForRole } from "@/lib/rbac"

const ROLES = ["superadmin", "manager", "editor", "support"]

export async function GET() {
  const session = await verifyAdminSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({
    roles: ROLES.map((role) => ({ role, permissions: permissionsForRole(role) })),
    current: { role: session.role, permissions: permissionsForRole(session.role) },
  })
}
