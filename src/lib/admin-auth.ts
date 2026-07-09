import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

const SECRET = process.env.ADMIN_JWT_SECRET ?? "syra-admin-dev-secret"
export const ADMIN_COOKIE = "syra_admin_token"
const LEGACY_ADMIN_COOKIE = "admin_token"

export type AdminSession = { id: string; email: string; name: string; role: string }

export async function verifyAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value ?? cookieStore.get(LEGACY_ADMIN_COOKIE)?.value
  if (!token) return null
  try {
    const payload = jwt.verify(token, SECRET) as AdminSession
    return payload
  } catch {
    return null
  }
}

export function createAdminToken(user: AdminSession): string {
  return jwt.sign(user, SECRET, { expiresIn: "7d" })
}

export async function verifyAdminPassword(email: string, password: string) {
  const login = email.trim().toLowerCase()
  const emailCandidates = login.includes("@") ? [login] : [`${login}@syra.local`, login]
  const user = await prisma.adminUser.findFirst({ where: { email: { in: emailCandidates } } })
  if (!user) return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
