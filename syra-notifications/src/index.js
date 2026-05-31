const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/orders");
const { startWorker } = require("./queue/worker");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.APP_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use("/api/auth/", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Start
app.listen(PORT, () => {
  console.log(`SYRA Notifications running on port ${PORT}`);
  startWorker();
});

module.exports = { prisma };
