const Queue = require("bull");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const emailQueue = new Queue("email", REDIS_URL, {
  defaultJobOptions: { attempts: 3, backoff: { type: "exponential", delay: 60000 } }
});

async function addEmailJob({ to, subject, template, data, userId, orderId }) {
  // Log notification
  const log = await prisma.notificationLog.create({
    data: { type: template, channel: "email", recipient: to, subject, status: "pending", orderId }
  });
  // Add to queue
  await emailQueue.add({ to, subject, template, data, logId: log.id });
  return log;
}

module.exports = { emailQueue, addEmailJob };
