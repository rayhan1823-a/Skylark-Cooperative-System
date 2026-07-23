// ======================================
// Imports
// ======================================

const cron = require("node-cron");
const createBackup = require("./backupService");

// ======================================
// Automatic Daily Backup
// Every Day 12:00 AM
// ======================================

const startBackupScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("======================================");
    console.log("🗄 Starting Automatic Daily Backup...");
    console.log("======================================");

    try {
      await createBackup();

      console.log("✅ Automatic Backup Completed");
    } catch (error) {
      console.log("❌ Automatic Backup Failed");
      console.log(error.message);
    }

    console.log("======================================");
  });

  console.log("✅ Daily Backup Scheduler Started");
};

module.exports = startBackupScheduler;