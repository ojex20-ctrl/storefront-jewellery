const fs = require("fs");
const path = require("path");

/**
 * Email sender — supports Brevo and Resend.
 * Templates are loaded from /app/templates/{slug}.html
 */
async function sendEmail({ to, subject, template, data }) {
  const provider = process.env.EMAIL_PROVIDER || "brevo";

  // Load template
  let html = loadTemplate(template, data);

  if (provider === "brevo") {
    return sendBrevo({ to, subject, html });
  } else if (provider === "resend") {
    return sendResend({ to, subject, html });
  }
  throw new Error(`Unknown email provider: ${provider}`);
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

async function sendBrevo({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not set");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "noreply@syra.in", name: "SYRA" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) throw new Error(`Brevo error: ${res.status} ${await res.text()}`);
  return res.json();
}

async function sendResend({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "SYRA <noreply@syra.in>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend error: ${res.status} ${await res.text()}`);
  return res.json();
}

module.exports = { sendEmail };
