import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "./db"

const SECRET = process.env.NEXTAUTH_SECRET ?? "syra-nextauth-secret-2024"

export type CustomerSession = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export async function verifyCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("customer_token")?.value
  if (!token) return null
  try {
    return jwt.verify(token, SECRET) as CustomerSession
  } catch {
    return null
  }
}

export function createCustomerToken(user: CustomerSession): string {
  return jwt.sign(user, SECRET, { expiresIn: "30d" })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createOtp(email: string, type: "register" | "login" | "reset") {
  // Delete old OTPs for this email+type
  await prisma.otp.deleteMany({ where: { email, type } })
  
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  
  const otp = await prisma.otp.create({
    data: { email, code, type, expiresAt }
  })
  
  return { otp, code }
}

export async function verifyOtp(email: string, code: string, type: string): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: { email, type, verified: false },
    orderBy: { createdAt: "desc" }
  })
  
  if (!otp) return false
  if (otp.attempts >= 5) return false
  if (new Date() > otp.expiresAt) return false
  
  if (otp.code !== code) {
    await prisma.otp.update({ where: { id: otp.id }, data: { attempts: otp.attempts + 1 } })
    return false
  }
  
  await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } })
  return true
}
