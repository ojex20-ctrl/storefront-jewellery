import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

/**
 * Signing secret for admin JWTs. Read lazily (not at module load) so a missing
 * value fails at request time rather than breaking `next build`. There is no
 * fallback: a hardcoded default would let anyone forge an admin token.
 */
function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not set")
  return secret
}

export type AdminSession = { id: string; email: string; name: string; role: string }

export async function verifyAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value
  if (!token) return null
  try {
    const payload = jwt.verify(token, getJwtSecret()) as AdminSession
    return payload
  } catch {
    return null
  }
}

export function createAdminToken(user: AdminSession): string {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "7d" })
}

export async function verifyAdminPassword(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email } })
  if (!user) return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
