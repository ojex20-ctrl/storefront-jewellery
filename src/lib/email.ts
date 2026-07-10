/**
 * Email sender — direct SMTP (Gmail) via nodemailer.
 *
 * Required env (see .env.example):
 *   SMTP_HOST   (default smtp.gmail.com)
 *   SMTP_PORT   (default 465)
 *   SMTP_USER   Gmail address used to authenticate
 *   SMTP_PASS   Gmail App Password (not the account password)
 *   EMAIL_FROM  From header, e.g. "SYRA <syrathelabel1@gmail.com>"
 *
 * If SMTP_USER / SMTP_PASS are not set, falls back to logging (dev mode).
 * Gmail requires the From address to match the authenticated SMTP_USER.
 */

import "server-only"
import nodemailer, { type Transporter } from "nodemailer"

const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com"
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "465", 10)
const SMTP_USER = process.env.SMTP_USER
// Gmail App Passwords are shown with spaces ("afqf tgdv omnc wwgw"); strip them.
const SMTP_PASS = process.env.SMTP_PASS?.replace(/\s+/g, "")
const FROM_EMAIL = process.env.EMAIL_FROM ?? (SMTP_USER ? `SYRA <${SMTP_USER}>` : "SYRA <noreply@syra.in>")

// Reuse a single connection pool across requests (Next.js keeps the module warm).
let transporter: Transporter | null = null
function getTransporter(): Transporter | null {
  if (!SMTP_USER || !SMTP_PASS) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const tx = getTransporter()

  if (!tx) {
    // Dev mode — no SMTP configured, log instead of sending.
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
    return false
  }

  await tx.sendMail({ from: FROM_EMAIL, to, subject, html })
  return true
}

export function verificationEmail(firstName: string, otp: string) {
  return {
    subject: "SYRA — Verify your email",
    html: `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
      <h2 style="color:#0a0a0a;">Welcome to SYRA, ${firstName}!</h2>
      <p style="color:#555;">Your verification code is:</p>
      <div style="margin:20px 0;padding:20px;background:#f5f3ee;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#0a0a0a;">${otp}</div>
      <p style="color:#999;font-size:12px;">This code expires in 5 minutes.</p>
      <p style="color:#999;font-size:11px;">© SYRA Jewellery</p>
    </div>`,
  }
}

export function loginOtpEmail(firstName: string, otp: string) {
  return {
    subject: "SYRA — Your login code",
    html: `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
      <h2 style="color:#0a0a0a;">Hi ${firstName},</h2>
      <p style="color:#555;">Your login code is:</p>
      <div style="margin:20px 0;padding:20px;background:#f5f3ee;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#0a0a0a;">${otp}</div>
      <p style="color:#999;font-size:12px;">This code expires in 5 minutes.</p>
    </div>`,
  }
}

export function resetPasswordEmail(firstName: string, otp: string) {
  return {
    subject: "SYRA — Reset your password",
    html: `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
      <h2 style="color:#0a0a0a;">Hi ${firstName},</h2>
      <p style="color:#555;">Your password reset code is:</p>
      <div style="margin:20px 0;padding:20px;background:#f5f3ee;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#0a0a0a;">${otp}</div>
      <p style="color:#999;font-size:12px;">This code expires in 5 minutes. If you didn't request this, ignore it.</p>
    </div>`,
  }
}
