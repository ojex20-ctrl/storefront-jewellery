import * as net from "node:net"
import * as tls from "node:tls"

type EmailPayload = { to: string; subject: string; html: string }

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.SMTP_USER
// Gmail App Passwords are displayed with spaces ("afqf tgdv omnc wwgw"); strip them.
const SMTP_PASS = process.env.SMTP_PASS?.replace(/\s+/g, "")
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

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://syrathelabel.com"

function money(value: number) {
  return `₹${(value / 100).toLocaleString("en-IN")}`
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

// ─── Shared branded email layout ────────────────────────────────────────────

const P = 'style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#3a3a3c;"'
const MUTED = 'style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#9a948a;"'

/** Table-based, inline-styled shell for maximum email-client compatibility. */
function emailShell(heading: string, bodyHtml: string, preheader = ""): string {
  const year = new Date().getFullYear()
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#efece6;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;color:#efece6;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efece6;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e6e1d8;border-radius:6px;overflow:hidden;">
    <tr><td style="background:#0b0b0c;padding:26px 32px;text-align:center;">
      <div style="color:#ffffff;font-size:22px;font-weight:600;letter-spacing:0.42em;">SYRA</div>
      <div style="color:#c9a36b;font-size:9px;letter-spacing:0.28em;text-transform:uppercase;margin-top:6px;">Anti-tarnish · Waterproof · For life</div>
    </td></tr>
    <tr><td style="padding:38px 32px 6px;">
      <h1 style="margin:0 0 18px;font-size:25px;line-height:1.25;color:#0b0b0c;font-weight:600;">${heading}</h1>
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:24px 32px 34px;">
      <hr style="border:none;border-top:1px solid #eeeae2;margin:0 0 18px;">
      <div style="font-size:11px;line-height:1.8;color:#9a948a;">
        <a href="${SITE}/collection" style="color:#0b0b0c;text-decoration:none;">Shop</a> &nbsp;·&nbsp;
        <a href="${SITE}/order-track" style="color:#0b0b0c;text-decoration:none;">Track order</a> &nbsp;·&nbsp;
        <a href="${SITE}/help" style="color:#0b0b0c;text-decoration:none;">Help</a>
        <br>© ${year} SYRA Jewellery · Made to be worn every day.
      </div>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr>
    <td style="background:#0b0b0c;border-radius:3px;">
      <a href="${href}" style="display:inline-block;padding:14px 30px;color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">${label}</a>
    </td></tr></table>`
}

function otpBox(code: string): string {
  return `<div style="margin:22px 0;padding:22px;background:#f6f2ea;border:1px solid #ece5d8;border-radius:6px;text-align:center;">
    <div style="font-size:34px;font-weight:700;letter-spacing:0.32em;color:#0b0b0c;">${code}</div>
  </div>`
}

function supportLink(): string {
  const phone = process.env.PUBLIC_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  if (!phone) return ""
  return `<p ${MUTED}>Need help? <a href="https://wa.me/${phone}?text=${encodeURIComponent("Hi, I need help with my order")}" style="color:#0b0b0c;">Message us on WhatsApp</a>.</p>`
}

function orderItemsTable(raw: string): string {
  let items: Array<{ name?: string; qty?: number; price?: number }> = []
  try { items = JSON.parse(raw) } catch { items = [] }
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f1ede5;font-size:14px;color:#1a1a1c;">${i.name ?? "SYRA item"} <span style="color:#9a948a;">× ${i.qty ?? 1}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #f1ede5;font-size:14px;color:#1a1a1c;">${money(i.price ?? 0)}</td>
      </tr>`,
    )
    .join("")
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #f1ede5;">${rows}</table>`
}

function orderHtml(order: MailOrder, title: string, message: string): string {
  const name = `${order.firstName} ${order.lastName ?? ""}`.trim()
  const paid = order.paymentStatus === "paid"
  const body = `
    <p ${P}>Hi ${name || "there"}, ${message}</p>
    ${orderItemsTable(order.items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#3a3a3c;">
      <tr><td style="padding:3px 0;">Order</td><td align="right" style="padding:3px 0;font-weight:600;color:#0b0b0c;">#${order.orderNumber}</td></tr>
      <tr><td style="padding:3px 0;">Status</td><td align="right" style="padding:3px 0;text-transform:capitalize;">${order.status.replace(/_/g, " ")}</td></tr>
      <tr><td style="padding:3px 0;">Payment</td><td align="right" style="padding:3px 0;color:${paid ? "#2e7d46" : "#9a948a"};text-transform:capitalize;">${order.paymentStatus}</td></tr>
      <tr><td style="padding:8px 0 0;font-size:17px;font-weight:600;color:#0b0b0c;">Total</td><td align="right" style="padding:8px 0 0;font-size:17px;font-weight:600;color:#0b0b0c;">${money(order.total)}</td></tr>
    </table>
    ${button(`${SITE}/order-track`, "Track your order")}
    <p ${MUTED}>Shipping to: ${order.address}, ${order.city}, ${order.state ?? ""} ${order.pincode}, ${order.country}</p>
    ${supportLink()}`
  return emailShell(title, body, `Order #${order.orderNumber} — ${order.status.replace(/_/g, " ")}`)
}

export async function sendOrderPlacedEmail(order: MailOrder) {
  return sendEmail({
    to: order.email,
    subject: `Your SYRA order #${order.orderNumber} is confirmed`,
    html: orderHtml(order, "Thank you for your order", "we've received it and we're getting it ready. Here's a summary:"),
  })
}

export async function sendOrderStatusUpdateEmail(order: MailOrder) {
  const nice = order.status.replace(/_/g, " ")
  return sendEmail({
    to: order.email,
    subject: `SYRA order #${order.orderNumber}: ${nice}`,
    html: orderHtml(order, `Your order is ${nice}`, `there's an update on your order — it's now ${nice}.`),
  })
}

export async function sendAdminNewOrderAlert(order: MailOrder) {
  const to = process.env.ADMIN_ORDER_ALERT_EMAIL
  if (!to) return false
  const body = `
    <p ${P}>A new order just came in.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#3a3a3c;">
      <tr><td style="padding:3px 0;">Customer</td><td align="right" style="padding:3px 0;">${order.firstName} ${order.lastName ?? ""}</td></tr>
      <tr><td style="padding:3px 0;">Email</td><td align="right" style="padding:3px 0;">${order.email}</td></tr>
      <tr><td style="padding:3px 0;">Phone</td><td align="right" style="padding:3px 0;">${order.phone ?? "—"}</td></tr>
      <tr><td style="padding:3px 0;">Payment</td><td align="right" style="padding:3px 0;text-transform:capitalize;">${order.paymentStatus}</td></tr>
      <tr><td style="padding:8px 0 0;font-weight:600;color:#0b0b0c;">Total</td><td align="right" style="padding:8px 0 0;font-weight:600;color:#0b0b0c;">${money(order.total)}</td></tr>
    </table>
    ${orderItemsTable(order.items)}
    ${button(`${SITE}/admin/orders/${order.id}`, "Open in admin")}`
  return sendEmail({ to, subject: `New order #${order.orderNumber} — ${money(order.total)}`, html: emailShell("New order received", body) })
}

// ─── Auth / account emails ──────────────────────────────────────────────────

export function verificationEmail(firstName: string, otp: string) {
  const body = `
    <p ${P}>Welcome to SYRA${firstName ? `, ${firstName}` : ""} — you're one step away. Enter this code to verify your email and activate your account:</p>
    ${otpBox(otp)}
    <p ${MUTED}>This code expires in 5 minutes. If you didn't create a SYRA account, you can safely ignore this email.</p>`
  return { subject: `${otp} is your SYRA verification code`, html: emailShell("Verify your email", body, "Your SYRA verification code") }
}

export function welcomeEmail(firstName: string) {
  const body = `
    <p ${P}>Your email is verified and your account is ready${firstName ? `, ${firstName}` : ""}. Welcome to SYRA — anti-tarnish, waterproof jewellery made to be worn every single day.</p>
    ${button(`${SITE}/collection`, "Start shopping")}
    <p ${MUTED}>Free shipping over ₹999 · 2-year anti-tarnish guarantee · Easy returns.</p>`
  return { subject: "Welcome to SYRA ✨", html: emailShell("You're in.", body, "Welcome to SYRA") }
}

export function loginOtpEmail(firstName: string, otp: string) {
  const body = `
    <p ${P}>Hi ${firstName || "there"}, use this code to sign in to your SYRA account:</p>
    ${otpBox(otp)}
    <p ${MUTED}>This code expires in 5 minutes. If you didn't try to sign in, please ignore this email.</p>`
  return { subject: `${otp} is your SYRA login code`, html: emailShell("Your login code", body, "Your SYRA login code") }
}

export function verificationLinkEmail(firstName: string, link: string) {
  const body = `
    <p ${P}>Welcome to SYRA${firstName ? `, ${firstName}` : ""}. Please confirm your email address to activate your account.</p>
    ${button(link, "Verify email")}
    <p ${MUTED}>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>`
  return { subject: "Verify your SYRA email", html: emailShell("Verify your email", body, "Confirm your SYRA email") }
}

export function resetPasswordLinkEmail(firstName: string, link: string) {
  const body = `
    <p ${P}>Hi ${firstName || "there"}, we received a request to reset your SYRA password. Use the button below to set a new one.</p>
    ${button(link, "Reset password")}
    <p ${MUTED}>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your password won't change.</p>`
  return { subject: "Reset your SYRA password", html: emailShell("Reset your password", body, "Reset your SYRA password") }
}

export function passwordChangedEmail(firstName: string) {
  const body = `
    <p ${P}>Hi ${firstName || "there"}, this is a confirmation that your SYRA account password was just changed.</p>
    <p ${MUTED}>If this was you, no action is needed. If you didn't change it, reset your password immediately using the button below.</p>
    ${button(`${SITE}/account/forgot-password`, "Reset password")}`
  return { subject: "Your SYRA password was changed", html: emailShell("Password changed", body, "Your SYRA password was changed") }
}

export function resetPasswordEmail(firstName: string, otp: string) {
  const body = `
    <p ${P}>Hi ${firstName || "there"}, use this code to reset your SYRA password:</p>
    ${otpBox(otp)}
    <p ${MUTED}>This code expires in 5 minutes. If you didn't request this, ignore this email.</p>`
  return { subject: `${otp} is your SYRA password reset code`, html: emailShell("Reset your password", body, "Your SYRA reset code") }
}
