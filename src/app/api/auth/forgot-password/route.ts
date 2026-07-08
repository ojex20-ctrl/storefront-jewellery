import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createOtp } from "@/lib/customer-auth"
import { sendEmail, resetPasswordEmail } from "@/lib/email"
import { isSupabaseConfigured, supabaseForgotPassword } from "@/lib/supabase-auth"

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

  if (isSupabaseConfigured()) {
    await supabaseForgotPassword(email).catch(() => null)
    return NextResponse.json({ message: "If the email exists, a reset link has been sent." })
  }

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer) {
    return NextResponse.json({ message: "If the email exists, an OTP has been sent." })
  }

  const { code } = await createOtp(email, "reset")
  const { subject, html } = resetPasswordEmail(customer.firstName, code)
  await sendEmail({ to: email, subject, html }).catch(() => {})

  return NextResponse.json({
    message: "OTP sent to your email",
    ...(process.env.NODE_ENV !== "production" && { otp: code }),
  })
}
