import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "./db"

/**
 * Signing secret for customer session JWTs. Read lazily so a missing value
 * fails at request time rather than at build. No hardcoded fallback — a known
 * default would let anyone forge a customer session.
 */
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set")
  return secret
}
export const CUSTOMER_COOKIE = "syra_customer_token"
const LEGACY_CUSTOMER_COOKIE = "customer_token"

export type CustomerSession = {
  id: string
  email: string
  firstName: string
  lastName: string
}

export async function verifyCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value ?? cookieStore.get(LEGACY_CUSTOMER_COOKIE)?.value
  if (!token) return null
  try {
    return jwt.verify(token, getSecret()) as CustomerSession
  } catch {
    return null
  }
}

export function createCustomerToken(user: CustomerSession): string {
  return jwt.sign(user, getSecret(), { expiresIn: "30d" })
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

const NON_LOCAL_PASSWORD_HASHES = new Set(["google", "supabase", ""])

export function hasLocalPasswordHash(passwordHash?: string | null) {
  return Boolean(passwordHash && !NON_LOCAL_PASSWORD_HASHES.has(passwordHash))
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function sanitizeName(value: string) {
  return value.trim().replace(/[<>]/g, "").slice(0, 80)
}

export function sanitizePhone(value: string) {
  return value.trim().replace(/[^\d+ -]/g, "").slice(0, 20)
}

export function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
}

export function isValidPhone(phone: string) {
  const cleaned = phone.replace(/[^\d]/g, "")
  return cleaned.length >= 8 && cleaned.length <= 15
}

export function createRawToken() {
  return crypto.randomBytes(32).toString("base64url")
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function createEmailVerificationToken(customerId: string) {
  // Invalidate any still-unused tokens for this customer, then issue a new one.
  await prisma.emailVerificationToken.updateMany({
    where: { customerId, usedAt: null },
    data: { usedAt: new Date() },
  })
  const token = createRawToken()
  await prisma.emailVerificationToken.create({
    data: {
      customerId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  })
  return token
}

export async function createPasswordResetToken(customerId: string) {
  await prisma.passwordResetToken.updateMany({
    where: { customerId, usedAt: null },
    data: { usedAt: new Date() },
  })
  const token = createRawToken()
  await prisma.passwordResetToken.create({
    data: {
      customerId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  })
  return token
}

export function publicCustomer(customer: { id: string; email: string; firstName: string; lastName: string; phone?: string | null }) {
  return {
    id: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone ?? "",
  }
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
