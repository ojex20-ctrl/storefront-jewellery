import * as net from "node:net"
import * as tls from "node:tls"

type EmailPayload = { to: string; subject: string; html: string }

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const FROM_EMAIL = process.env.SMTP_FROM ?? process.env.SMTP_FROM_EMAIL ?? process.env.EMAIL_FROM ?? "SYRA <noreply@syra.in>"

function isSmtpConfigured() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && FROM_EMAIL)
}

function fromAddress() {
  return FROM_EMAIL.match(/<(.+)>/)?.[1] ?? FROM_EMAIL
}

function encodeHeader(value: string) {
  return value.replace(/\r|\n/g, " ")
}

function buildMessage({ to, subject, html }: EmailPayload) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  return [
    `From: ${FROM_EMAIL}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html || text,
  ].join("\r\n")
}

async function smtpSend(payload: EmailPayload) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return false

  await new Promise<void>((resolve, reject) => {
    const socket =
      SMTP_PORT === 465
        ? tls.connect({ port: SMTP_PORT, host: SMTP_HOST, servername: SMTP_HOST })
        : net.connect(SMTP_PORT, SMTP_HOST)
    let secure: net.Socket | tls.TLSSocket = socket
    let buffer = ""

    const waitFor = (prefixes: string[]) =>
      new Promise<string>((ok, fail) => {
        const onData = (chunk: Buffer) => {
          buffer += chunk.toString("utf8")
          const lines = buffer.split(/\r?\n/)
          const last = [...lines].reverse().find((line) => /^\d{3} /.test(line))
          if (!last) return
          const code = last.slice(0, 3)
          if (prefixes.includes(code)) {
            cleanup()
            const out = buffer
            buffer = ""
            ok(out)
          } else if (/^[45]/.test(code)) {
            cleanup()
            fail(new Error(last))
          }
        }
        const onError = (err: Error) => {
          cleanup()
          fail(err)
        }
        const cleanup = () => {
          secure.off("data", onData)
          secure.off("error", onError)
        }
        secure.on("data", onData)
        secure.on("error", onError)
      })

    const write = async (command: string, ok: string[] = ["250"]) => {
      secure.write(`${command}\r\n`)
      return waitFor(ok)
    }

    socket.once("error", reject)
    const onReady = async () => {
      try {
        await waitFor(["220"])
        await write("EHLO syra.local")
        if (SMTP_PORT !== 465) {
          await write("STARTTLS", ["220"])
          secure = tls.connect({ socket, servername: SMTP_HOST })
          await new Promise<void>((ok) => secure.once("secureConnect", ok))
          await write("EHLO syra.local")
        }
        await write("AUTH LOGIN", ["334"])
        await write(Buffer.from(SMTP_USER).toString("base64"), ["334"])
        await write(Buffer.from(SMTP_PASS).toString("base64"), ["235"])
        await write(`MAIL FROM:<${fromAddress()}>`)
        await write(`RCPT TO:<${payload.to}>`, ["250", "251"])
        await write("DATA", ["354"])
        secure.write(`${buildMessage(payload)}\r\n.\r\n`)
        await waitFor(["250"])
        secure.write("QUIT\r\n")
        secure.end()
        resolve()
      } catch (err) {
        secure.destroy()
        reject(err)
      }
    }
    if (SMTP_PORT === 465) {
      ;(socket as tls.TLSSocket).once("secureConnect", onReady)
    } else {
      socket.once("connect", onReady)
    }
  })

  return true
}

export async function sendEmail(payload: EmailPayload) {
  if (!isSmtpConfigured()) {
    console.log(`[EMAIL skipped] To: ${payload.to} | Subject: ${payload.subject}`)
    return false
  }
  try {
    return await smtpSend(payload)
  } catch (err) {
    console.error("[EMAIL error]", err instanceof Error ? err.message : err)
    return false
  }
}

function money(value: number) {
  return `Rs. ${(value / 100).toLocaleString("en-IN")}`
}

type MailOrder = {
  id: string
  orderNumber: number
  email: string
  phone?: string | null
  firstName: string
  lastName?: string | null
  address: string
  city: string
  state?: string | null
  pincode: string
  country: string
  items: string
  total: number
  paymentStatus: string
  status: string
}

function parseOrderItems(raw: string) {
  try {
    const items = JSON.parse(raw) as Array<{ name?: string; qty?: number; price?: number }>
    return items.map((item) => `<li>${item.name ?? "SYRA item"} x ${item.qty ?? 1} - ${money(item.price ?? 0)}</li>`).join("")
  } catch {
    return "<li>Order items</li>"
  }
}

function supportLink() {
  const phone = process.env.PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  if (!phone) return ""
  return `<p><a href="https://wa.me/${phone}?text=${encodeURIComponent("Hi, I need help with my order")}">Contact support on WhatsApp</a></p>`
}

function orderHtml(order: MailOrder, title: string, message: string) {
  const name = `${order.firstName} ${order.lastName ?? ""}`.trim()
  return `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#1a1a1c">
    <h2>${title}</h2>
    <p>Hi ${name || "there"},</p>
    <p>${message}</p>
    <p><strong>Order:</strong> #${order.orderNumber}<br/>
    <strong>Status:</strong> ${order.status.replace(/_/g, " ")}<br/>
    <strong>Payment:</strong> ${order.paymentStatus}<br/>
    <strong>Total:</strong> ${money(order.total)}</p>
    <h3>Items</h3>
    <ul>${parseOrderItems(order.items)}</ul>
    <h3>Shipping address</h3>
    <p>${order.address}, ${order.city}, ${order.state ?? ""} ${order.pincode}, ${order.country}</p>
    ${supportLink()}
    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"}">Visit SYRA</a></p>
  </div>`
}

export async function sendOrderPlacedEmail(order: MailOrder) {
  return sendEmail({
    to: order.email,
    subject: `SYRA order #${order.orderNumber} placed`,
    html: orderHtml(order, "Order placed", "We have received your order."),
  })
}

export async function sendOrderStatusUpdateEmail(order: MailOrder) {
  return sendEmail({
    to: order.email,
    subject: `SYRA order #${order.orderNumber}: ${order.status.replace(/_/g, " ")}`,
    html: orderHtml(order, "Order update", `Your order is now ${order.status.replace(/_/g, " ")}.`),
  })
}

export async function sendAdminNewOrderAlert(order: MailOrder) {
  const to = process.env.ADMIN_ORDER_ALERT_EMAIL
  if (!to) return false
  const adminLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002"}/admin/orders`
  return sendEmail({
    to,
    subject: `New SYRA order #${order.orderNumber}`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>New order received</h2>
      <p><strong>Customer:</strong> ${order.firstName} ${order.lastName ?? ""}<br/>
      <strong>Email:</strong> ${order.email}<br/>
      <strong>Phone:</strong> ${order.phone ?? ""}<br/>
      <strong>Total:</strong> ${money(order.total)}<br/>
      <strong>Payment:</strong> ${order.paymentStatus}</p>
      <ul>${parseOrderItems(order.items)}</ul>
      <p><a href="${adminLink}">Open admin orders</a></p>
    </div>`,
  })
}

export function verificationEmail(firstName: string, otp: string) {
  return {
    subject: "SYRA - Verify your email",
    html: `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
      <h2>Welcome to SYRA, ${firstName}!</h2>
      <p>Your verification code is:</p>
      <div style="margin:20px 0;padding:20px;background:#f5f3ee;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;">${otp}</div>
      <p style="color:#777;font-size:12px;">This code expires in 5 minutes.</p>
    </div>`,
  }
}

export function verificationLinkEmail(firstName: string, link: string) {
  return {
    subject: "SYRA - Verify your email",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1c">
      <h2>Welcome to SYRA, ${firstName || "there"}.</h2>
      <p>Please verify your email before signing in.</p>
      <p style="margin:28px 0"><a href="${link}" style="background:#0b0b0c;color:#fff;padding:14px 22px;text-decoration:none;text-transform:uppercase;letter-spacing:.12em;font-size:12px">Verify email</a></p>
      <p style="color:#777;font-size:12px">This link expires in 24 hours.</p>
    </div>`,
  }
}

export function resetPasswordLinkEmail(firstName: string, link: string) {
  return {
    subject: "SYRA - Reset your password",
    html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1c">
      <h2>Hi ${firstName || "there"},</h2>
      <p>Use this secure link to set a new SYRA password.</p>
      <p style="margin:28px 0"><a href="${link}" style="background:#0b0b0c;color:#fff;padding:14px 22px;text-decoration:none;text-transform:uppercase;letter-spacing:.12em;font-size:12px">Reset password</a></p>
      <p style="color:#777;font-size:12px">This link expires in 30 minutes. If you did not request it, ignore this email.</p>
    </div>`,
  }
}

export function loginOtpEmail(firstName: string, otp: string) {
  return {
    subject: "SYRA - Your login code",
    html: `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
      <h2>Hi ${firstName},</h2>
      <p>Your login code is:</p>
      <div style="margin:20px 0;padding:20px;background:#f5f3ee;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;">${otp}</div>
      <p style="color:#777;font-size:12px;">This code expires in 5 minutes.</p>
    </div>`,
  }
}

export function resetPasswordEmail(firstName: string, otp: string) {
  return {
    subject: "SYRA - Reset your password",
    html: `<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
      <h2>Hi ${firstName},</h2>
      <p>Your password reset code is:</p>
      <div style="margin:20px 0;padding:20px;background:#f5f3ee;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;">${otp}</div>
      <p style="color:#777;font-size:12px;">This code expires in 5 minutes.</p>
    </div>`,
  }
}
