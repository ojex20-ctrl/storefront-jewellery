const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

/**
 * Email sender — direct SMTP (Gmail) via nodemailer.
 * Templates are loaded from /app/templates/{slug}.html
 *
 * Required env: SMTP_HOST (default smtp.gmail.com), SMTP_PORT (default 465),
 * SMTP_USER, SMTP_PASS (Gmail App Password), EMAIL_FROM.
 */
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.SMTP_USER;
  // Gmail App Passwords are displayed with spaces; strip them.
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  if (!user || !pass) throw new Error("SMTP_USER / SMTP_PASS not set");
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });
  return transporter;
}

async function sendEmail({ to, subject, template, data }) {
  const html = loadTemplate(template, data);
  const from = process.env.EMAIL_FROM || `SYRA <${process.env.SMTP_USER}>`;
  return getTransporter().sendMail({ from, to, subject, html });
}

function loadTemplate(slug, data) {
  const templatePath = path.join(__dirname, "../../templates", `${slug}.html`);
  let html;
  try {
    html = fs.readFileSync(templatePath, "utf-8");
  } catch {
    // Fallback plain template
    html = `<h2>{{subject}}</h2><p>Hi {{firstName}},</p><p>{{message}}</p>`;
  }
  // Replace placeholders
  for (const [key, value] of Object.entries(data || {})) {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return html;
}

module.exports = { sendEmail };
