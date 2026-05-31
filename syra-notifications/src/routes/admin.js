const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { addEmailJob } = require("../queue/emailQueue");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = process.env.APP_SECRET || "dev-secret";

// Admin auth middleware
function adminAuth(req, res, next) {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try { req.admin = jwt.verify(token, SECRET); next(); }
  catch { return res.status(401).json({ error: "Invalid token" }); }
}

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await argon2.verify(admin.passwordHash, password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: admin.id, email: admin.email }, SECRET, { expiresIn: "7d" });
  res.cookie("admin_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
});

// List users
router.get("/users", adminAuth, async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, mobile: true, firstName: true, lastName: true, emailVerified: true, active: true, whatsappConsent: true, createdAt: true } });
  res.json({ users });
});

// List orders
router.get("/orders", adminAuth, async (req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, include: { user: { select: { firstName: true, lastName: true, email: true, mobile: true } } } });
  res.json({ orders });
});

// Update order status (triggers email)
router.put("/orders/:id/status", adminAuth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["placed", "payment_success", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refund_initiated", "refund_completed"];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status }, include: { user: true } });
  await prisma.auditLog.create({ data: { userId: order.userId, action: `order_status_${status}`, details: `Order ${order.orderNumber}`, ip: req.ip } });

  // Send order update email
  await addEmailJob({ to: order.user.email, subject: `SYRA Order ${order.orderNumber} — ${status.replace(/_/g, " ")}`, template: "order_update", data: { firstName: order.user.firstName, orderNumber: order.orderNumber, status }, orderId: order.id });

  // WhatsApp link
  const waLink = order.user.whatsappConsent ? `https://wa.me/${order.user.mobile.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${order.user.firstName}, your SYRA order ${order.orderNumber} status: ${status.replace(/_/g, " ")}`)}` : null;

  res.json({ order, whatsappLink: waLink });
});

// Notification logs
router.get("/notifications", adminAuth, async (req, res) => {
  const logs = await prisma.notificationLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  res.json({ logs });
});

// Email templates
router.get("/templates", adminAuth, async (req, res) => {
  const templates = await prisma.emailTemplate.findMany();
  res.json({ templates });
});

router.put("/templates/:id", adminAuth, async (req, res) => {
  const { subject, body } = req.body;
  const template = await prisma.emailTemplate.update({ where: { id: req.params.id }, data: { subject, body } });
  res.json({ template });
});

// Resend verification
router.post("/users/:id/resend-verification", adminAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.emailVerified) return res.json({ message: "Not needed" });
  const { v4: uuid } = require("uuid");
  const verifyToken = uuid();
  await prisma.user.update({ where: { id: user.id }, data: { verifyToken, verifyExpires: new Date(Date.now() + 30 * 60 * 1000) } });
  const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${verifyToken}`;
  await addEmailJob({ to: user.email, subject: "Verify your SYRA account", template: "email_verification", data: { firstName: user.firstName, verifyUrl }, userId: user.id });
  res.json({ message: "Verification email sent" });
});

// Audit logs
router.get("/audit-logs", adminAuth, async (req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { user: { select: { email: true } } } });
  res.json({ logs });
});

module.exports = router;
