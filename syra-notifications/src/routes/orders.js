const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const SECRET = process.env.APP_SECRET || "dev-secret";

function auth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { return res.status(401).json({ error: "Invalid token" }); }
}

// Get my orders
router.get("/", auth, async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } });
  res.json({ orders });
});

// Get single order
router.get("/:id", auth, async (req, res) => {
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json({ order });
});

module.exports = router;
