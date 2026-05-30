import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

const SECRET = process.env.ADMIN_JWT_SECRET ?? "syra-admin-dev-secret"

export type AdminSession = { id: string; email: string; name: string; role: string }

export async function verifyAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value
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
  const user = await prisma.adminUser.findUnique({ where: { email } })
  if (!user) return null
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
