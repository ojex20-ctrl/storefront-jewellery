/**
 * Email sender — uses Brevo (free 300/day) or Resend (free 100/day).
 * Set BREVO_API_KEY or RESEND_API_KEY in .env
 * If neither is set, logs to console (dev mode).
 */

const BREVO_KEY = process.env.BREVO_API_KEY
const RESEND_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.EMAIL_FROM ?? "SYRA <noreply@syra.in>"

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (BREVO_KEY) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { email: FROM_EMAIL.match(/<(.+)>/)?.[1] ?? "noreply@syra.in", name: "SYRA" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })
    if (!res.ok) throw new Error(`Brevo: ${res.status}`)
    return true
  }

  if (RESEND_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    })
    if (!res.ok) throw new Error(`Resend: ${res.status}`)
    return true
  }

  // Dev mode — log to console
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
  return false
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
