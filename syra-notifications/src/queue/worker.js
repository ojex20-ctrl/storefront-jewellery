const { emailQueue } = require("./emailQueue");
const { sendEmail } = require("../services/email");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function startWorker() {
  emailQueue.process(async (job) => {
    const { to, subject, template, data, logId } = job.data;
    try {
      await sendEmail({ to, subject, template, data });
      await prisma.notificationLog.update({ where: { id: logId }, data: { status: "sent", sentAt: new Date(), attempts: job.attemptsMade + 1 } });
    } catch (err) {
      await prisma.notificationLog.update({ where: { id: logId }, data: { status: "failed", error: err.message, attempts: job.attemptsMade + 1 } });
      throw err; // Bull will retry
    }
  });

  emailQueue.on("completed", (job) => console.log(`Email sent: ${job.data.to}`));
  emailQueue.on("failed", (job, err) => console.error(`Email failed: ${job.data.to} - ${err.message}`));
  console.log("Email worker started");
}

module.exports = { startWorker };
