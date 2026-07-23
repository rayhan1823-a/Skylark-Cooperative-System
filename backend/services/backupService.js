// ======================================
// Imports
// ======================================

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const {
  encryptBackup,
} = require("../utils/backupEncryption");

// ======================================
// Models
// ======================================

const User = require("../models/User");
const Member = require("../models/Member");
const Deposit = require("../models/Deposit");
const Payment = require("../models/Payment");
const Loan = require("../models/Loan");
const DepositRate = require("../models/DepositRate");
const PaymentAllocation = require("../models/PaymentAllocation");
const MemberExit = require("../models/MemberExit");
const Transaction = require("../models/Transaction");
const FundTransaction = require("../models/FundTransaction");

// ======================================
// Backup Folder
// ======================================

const BACKUP_FOLDER = path.join(__dirname, "../backups");

if (!fs.existsSync(BACKUP_FOLDER)) {
  fs.mkdirSync(BACKUP_FOLDER, {
    recursive: true,
  });
}

// ======================================
// Delete Old Backup
// Keep Last 30 Backup
// ======================================

const deleteOldBackups = () => {
  const files = fs
    .readdirSync(BACKUP_FOLDER)
    .filter((file) => file.endsWith(".zip"))
    .map((file) => ({
      name: file,
      time: fs.statSync(
        path.join(BACKUP_FOLDER, file)
      ).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length <= 30) return;

  const oldFiles = files.slice(30);

  oldFiles.forEach((file) => {
    fs.unlinkSync(
      path.join(BACKUP_FOLDER, file.name)
    );

    console.log("🗑 Old Backup Deleted:", file.name);
  });
};

// ======================================
// Create Backup
// ======================================

const createBackup = async () => {
  try {
    console.log("==================================");
    console.log("📦 Creating Backup...");
    console.log("==================================");

    const backupData = {
      backupDate: new Date(),
      version: "1.0.0",

      users: await User.find(),

      members: await Member.find(),

      deposits: await Deposit.find(),

      payments: await Payment.find(),

      loans: await Loan.find(),

      depositRates: await DepositRate.find(),

      paymentAllocations:
        await PaymentAllocation.find(),

      memberExits:
        await MemberExit.find(),

      transactions:
        await Transaction.find(),

      fundTransactions:
        await FundTransaction.find(),
    };

    const timestamp = Date.now();

    const jsonName = `backup-${timestamp}.json`;

    const zipName = `backup-${timestamp}.zip`;

    const jsonPath = path.join(
      BACKUP_FOLDER,
      jsonName
    );

    const zipPath = path.join(
      BACKUP_FOLDER,
      zipName
    );

    // ======================================
    // Encrypt Backup
    // ======================================

    const encryptedBackup =
      encryptBackup(backupData);

    fs.writeFileSync(
      jsonPath,
      encryptedBackup
    );

    // ======================================
    // ZIP Backup
    // ======================================

    const output =
      fs.createWriteStream(zipPath);

    const archive = archiver("zip", {
      zlib: {
        level: 9,
      },
    });

    archive.pipe(output);

    archive.file(jsonPath, {
      name: jsonName,
    });

    await archive.finalize();

    // Wait until ZIP file is completely written
    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
    });

    // Delete JSON
    fs.unlinkSync(jsonPath);

    // Delete Old Backup
    deleteOldBackups();

    console.log("✅ Backup Completed Successfully");
    console.log("📁", zipName);
  } catch (err) {
    console.log("==================================");
    console.log("❌ Backup Error");
    console.log(err);
    console.log("==================================");
  }
};

// ======================================
// Scheduler
// Everyday 2:00 AM
// ======================================

const startBackupScheduler = () => {
  cron.schedule("0 2 * * *", async () => {
    await createBackup();
  });

  console.log("✅ Automatic Backup Scheduler Started");
  console.log("🕑 Backup Time : Everyday 02:00 AM");
};

// ======================================
// Exports
// ======================================

module.exports = {
  startBackupScheduler,
  createBackup,
};