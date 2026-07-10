import type { AdminSession } from "./admin-auth"

export type AdminPermission =
  | "products:read"
  | "products:write"
  | "orders:read"
  | "orders:write"
  | "content:write"
  | "settings:write"
  | "users:manage"

const ROLE_PERMISSIONS: Record<string, AdminPermission[]> = {
  superadmin: ["products:read", "products:write", "orders:read", "orders:write", "content:write", "settings:write", "users:manage"],
  manager: ["products:read", "products:write", "orders:read", "orders:write", "content:write"],
  editor: ["products:read", "products:write", "content:write"],
  support: ["orders:read", "orders:write"],
}

export function hasPermission(session: AdminSession | null, permission: AdminPermission) {
  if (!session) return false
  return (ROLE_PERMISSIONS[session.role] ?? []).includes(permission)
}

export function permissionsForRole(role: string) {
  return ROLE_PERMISSIONS[role] ?? []
}

export function assertPermission(session: AdminSession | null, permission: AdminPermission) {
  if (!session) return { ok: false as const, status: 401, error: "Unauthorized" }
  if (!hasPermission(session, permission)) return { ok: false as const, status: 403, error: "Forbidden" }
  return { ok: true as const }
}
