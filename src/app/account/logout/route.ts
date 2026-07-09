import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { CUSTOMER_COOKIE } from "@/lib/customer-auth"

async function clearCustomerSession() {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_COOKIE)
  cookieStore.delete("customer_token")
}

export async function GET(req: Request) {
  await clearCustomerSession()
  return NextResponse.redirect(new URL("/", req.url))
}

export async function POST() {
  await clearCustomerSession()
  return NextResponse.json({ ok: true })
}
