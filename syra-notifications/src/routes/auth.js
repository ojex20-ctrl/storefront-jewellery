const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const validator = require("validator");
const { PrismaClient } = require("@prisma/client");
const { addEmailJob } = require("../queue/emailQueue");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = process.env.APP_SECRET || "dev-secret";

// Register
router.post("/register", async (req, res) => {
  try {
    let { firstName, lastName, email, mobile, password, whatsappConsent } = req.body;

    // Validate
    if (!firstName || !lastName || !email || !mobile || !password) {
      return res.status(400).json({ error: "All fields required" });
    }
    email = validator.normalizeEmail(email);
    if (!validator.isEmail(email)) return res.status(400).json({ error: "Invalid email" });
    if (!validator.isMobilePhone(mobile, "any")) return res.status(400).json({ error: "Invalid mobile" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be 8+ characters" });
    firstName = validator.escape(firstName.trim());
    lastName = validator.escape(lastName.trim());

    // Check duplicates
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(409).json({ error: "Email already registered" });
    const existingMobile = await prisma.user.findUnique({ where: { mobile } });
    if (existingMobile) return res.status(409).json({ error: "Mobile number already registered" });

    // Create user
    const passwordHash = await argon2.hash(password);
    const verifyToken = uuid();
    const verifyExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    const user = await prisma.user.create({
      data: {
        email, mobile, passwordHash, firstName, lastName,
        verifyToken, verifyExpires,
        whatsappConsent: !!whatsappConsent,
        consentIp: whatsappConsent ? req.ip : null,
        consentAt: whatsappConsent ? new Date() : null,
      }
    });

    // Audit log
    await prisma.auditLog.create({ data: { userId: user.id, action: "register", ip: req.ip } });

    // Send verification email
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${verifyToken}`;
    await addEmailJob({
      to: email,
      subject: "Verify your SYRA account",
      template: "email_verification",
      data: { firstName, verifyUrl },
      userId: user.id,
    });

    res.status(201).json({ message: "Account created. Check your email to verify." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Verify email
router.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: "Token required" });

  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) return res.status(404).json({ error: "Invalid token" });
  if (new Date() > user.verifyExpires) return res.status(410).json({ error: "Token expired" });

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, active: true, verifyToken: null, verifyExpires: null }
  });
  await prisma.auditLog.create({ data: { userId: user.id, action: "email_verified", ip: req.ip } });

  res.json({ message: "Email verified. You can now login." });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (!user.active) return res.status(403).json({ error: "Account not verified" });

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "30d" });
  res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, email: user.email, firstName: user.firstName } });
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.json({ message: "If email exists, reset link sent." });

  const resetToken = uuid();
  const resetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
  await addEmailJob({
    to: email,
    subject: "Reset your SYRA password",
    template: "password_reset",
    data: { firstName: user.firstName, resetUrl },
    userId: user.id,
  });

  res.json({ message: "If email exists, reset link sent." });
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Token and password required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be 8+ characters" });

  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (!user || new Date() > user.resetExpires) return res.status(410).json({ error: "Invalid or expired token" });

  const passwordHash = await argon2.hash(password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetExpires: null } });
  await prisma.auditLog.create({ data: { userId: user.id, action: "password_reset", ip: req.ip } });

  res.json({ message: "Password reset successfully" });
});

// Resend verification
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return res.json({ message: "Done" });

  const verifyToken = uuid();
  const verifyExpires = new Date(Date.now() + 30 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { verifyToken, verifyExpires } });

  const verifyUrl = `${process.env.APP_URL}/api/auth/verify?token=${verifyToken}`;
  await addEmailJob({ to: email, subject: "Verify your SYRA account", template: "email_verification", data: { firstName: user.firstName, verifyUrl }, userId: user.id });

  res.json({ message: "Verification email resent" });
});

module.exports = router;
