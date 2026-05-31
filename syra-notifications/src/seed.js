const { PrismaClient } = require("@prisma/client");
const argon2 = require("argon2");
const prisma = new PrismaClient();

async function main() {
  // Create admin
  const hash = await argon2.hash(process.env.ADMIN_PASSWORD || "adnan123");
  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@syra.in" },
    update: { passwordHash: hash },
    create: { email: process.env.ADMIN_EMAIL || "admin@syra.in", passwordHash: hash, name: "SYRA Admin" },
  });

  // Create email templates
  const templates = [
    { slug: "email_verification", name: "Email Verification", subject: "Verify your SYRA account", body: "<h2>Welcome to SYRA, {{firstName}}!</h2><p>Click below to verify your email:</p><a href='{{verifyUrl}}'>Verify Email</a><p>This link expires in 30 minutes.</p>" },
    { slug: "password_reset", name: "Password Reset", subject: "Reset your SYRA password", body: "<h2>Hi {{firstName}},</h2><p>Click below to reset your password:</p><a href='{{resetUrl}}'>Reset Password</a><p>This link expires in 30 minutes.</p>" },
    { slug: "order_update", name: "Order Update", subject: "SYRA Order {{orderNumber}} — {{status}}", body: "<h2>Hi {{firstName}},</h2><p>Your order <strong>{{orderNumber}}</strong> status has been updated to: <strong>{{status}}</strong></p><p>Thank you for shopping with SYRA!</p>" },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({ where: { slug: t.slug }, update: t, create: t });
  }

  console.log("Seeded: admin user + email templates");
}

main().catch(console.error).finally(() => prisma.$disconnect());
