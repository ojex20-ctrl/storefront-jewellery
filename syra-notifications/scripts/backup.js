/**
 * Database backup script.
 * Run: node scripts/backup.js
 * Creates a timestamped SQL dump in ./backups/
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const backupDir = path.join(__dirname, "../backups");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `backup-${timestamp}.sql`;
const filepath = path.join(backupDir, filename);

const dbUrl = process.env.DATABASE_URL || "postgresql://syra:changeme@localhost:5432/syra_notifications";
const url = new URL(dbUrl);

try {
  execSync(`PGPASSWORD="${url.password}" pg_dump -h ${url.hostname} -p ${url.port} -U ${url.username} ${url.pathname.slice(1)} > ${filepath}`);
  console.log(`Backup created: ${filepath}`);
} catch (err) {
  console.error("Backup failed:", err.message);
  process.exit(1);
}
