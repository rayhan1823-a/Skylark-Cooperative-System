// ======================================
// Imports
// ======================================

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const unzipper = require("unzipper");

const User = require("../models/User");
const Member = require("../models/Member");
const Deposit = require("../models/Deposit");
const Payment = require("../models/Payment");
const Loan = require("../models/Loan");
const FundTransaction = require("../models/FundTransaction");
const PaymentAllocation = require("../models/PaymentAllocation");
const DepositRate = require("../models/DepositRate");
const Transaction = require("../models/Transaction");
const MemberExit = require("../models/MemberExit");

const {
  encryptBackup,
  decryptBackup,
} = require("../utils/backupEncryption");

// ======================================
// Export Backup
// ======================================

const exportBackup = async (req, res) => {

  try {

    console.log("========== BACKUP EXPORT ==========");

    const backupData = {

      backupDate: new Date(),

      users: await User.find(),

      members: await Member.find(),

      deposits: await Deposit.find(),

      payments: await Payment.find(),

      loans: await Loan.find(),

      fundTransactions: await FundTransaction.find(),

      paymentAllocations: await PaymentAllocation.find(),

      depositRates: await DepositRate.find(),

      transactions: await Transaction.find(),

      memberExits: await MemberExit.find(),

    };

    const encryptedBackup =
      encryptBackup(backupData);

    const backupFolder = path.join(
      __dirname,
      "../backup-temp"
    );

    if (!fs.existsSync(backupFolder)) {

      fs.mkdirSync(backupFolder, {
        recursive: true,
      });

    }

    const jsonPath = path.join(
      backupFolder,
      "backup.json"
    );

    fs.writeFileSync(
      jsonPath,
      encryptedBackup,
      "utf8"
    );

    const zipName =
      `backup-${Date.now()}.zip`;

    const zipPath = path.join(
      backupFolder,
      zipName
    );

    const output =
      fs.createWriteStream(zipPath);

    const archive = archiver("zip", {
      zlib: {
        level: 9,
      },
    });

    archive.pipe(output);

    archive.file(jsonPath, {
      name: "backup.json",
    });
    output.on("close", () => {

      console.log("Backup ZIP Created");

      return res.download(
        zipPath,
        zipName,
        () => {

          try {

            if (fs.existsSync(jsonPath)) {
              fs.unlinkSync(jsonPath);
            }

            if (fs.existsSync(zipPath)) {
              fs.unlinkSync(zipPath);
            }

          } catch (err) {

            console.log(err);

          }

        }
      );

    });

    archive.on("error", (err) => {

      throw err;

    });

    await archive.finalize();

  } catch (error) {

    console.log("========== EXPORT ERROR ==========");
    console.log(error);
    console.log(error.stack);
    console.log("=================================");

    return res.status(500).json({

      success: false,

      message: error.message || "Backup Failed",

    });

  }

};

// ======================================
// Restore Backup
// ======================================

const restoreBackup = async (req, res) => {

  console.log("STEP 1");

  let uploadedZip = null;
  let extractFolder = null;

  try {

    console.log("STEP 2");

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message: "Backup ZIP file is required.",
      });

    }

    console.log("STEP 3");

    uploadedZip = req.file.path;

    console.log("Uploaded File:", uploadedZip);

    extractFolder = path.join(
      __dirname,
      "../restore-temp",
      Date.now().toString()
    );

    fs.mkdirSync(extractFolder, {
      recursive: true,
    });

    console.log("STEP 4");

    await fs
      .createReadStream(uploadedZip)
      .pipe(
        unzipper.Extract({
          path: extractFolder,
        })
      )
      .promise();

    console.log("STEP 5");

    const files =
      fs.readdirSync(extractFolder);

    const jsonFile =
      files.find(file =>
        file.endsWith(".json")
      );

    if (!jsonFile) {

      throw new Error("backup.json not found.");

    }

    const encryptedData =
      fs.readFileSync(
        path.join(extractFolder, jsonFile),
        "utf8"
      );

    console.log("STEP 6");

    const backupData =
      decryptBackup(encryptedData);
    console.log("STEP 7");

    // ======================================
    // Delete Old Data
    // ======================================

    await User.deleteMany({});
    await Member.deleteMany({});
    await Deposit.deleteMany({});
    await Payment.deleteMany({});
    await Loan.deleteMany({});
    await FundTransaction.deleteMany({});
    await PaymentAllocation.deleteMany({});
    await DepositRate.deleteMany({});
    await Transaction.deleteMany({});
    await MemberExit.deleteMany({});

    console.log("STEP 8");

    // ======================================
    // Restore Data
    // ======================================

    if (backupData.users?.length)
      await User.insertMany(backupData.users);

    if (backupData.members?.length)
      await Member.insertMany(backupData.members);

    if (backupData.deposits?.length)
      await Deposit.insertMany(backupData.deposits);

    if (backupData.payments?.length)
      await Payment.insertMany(backupData.payments);

    if (backupData.loans?.length)
      await Loan.insertMany(backupData.loans);

    if (backupData.fundTransactions?.length)
      await FundTransaction.insertMany(
        backupData.fundTransactions
      );

    if (backupData.paymentAllocations?.length)
      await PaymentAllocation.insertMany(
        backupData.paymentAllocations
      );

    if (backupData.depositRates?.length)
      await DepositRate.insertMany(
        backupData.depositRates
      );

    if (backupData.transactions?.length)
      await Transaction.insertMany(
        backupData.transactions
      );

    if (backupData.memberExits?.length)
      await MemberExit.insertMany(
        backupData.memberExits
      );

    console.log("STEP 9");

    // ======================================
    // Cleanup
    // ======================================

    if (fs.existsSync(extractFolder)) {
      fs.rmSync(extractFolder, {
        recursive: true,
        force: true,
      });
    }

    if (fs.existsSync(uploadedZip)) {
      fs.unlinkSync(uploadedZip);
    }

    return res.status(200).json({
      success: true,
      message: "Database Restored Successfully",
    });

  } catch (error) {

    console.log("========== RESTORE ERROR ==========");
    console.log(error);
    console.log(error.stack);
    console.log("===================================");

    try {

      if (extractFolder && fs.existsSync(extractFolder)) {
        fs.rmSync(extractFolder, {
          recursive: true,
          force: true,
        });
      }

      if (uploadedZip && fs.existsSync(uploadedZip)) {
        fs.unlinkSync(uploadedZip);
      }

    } catch (e) {
      console.log(e);
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Restore Failed",
    });

  }

};

// ======================================
// Exports
// ======================================

module.exports = {
  exportBackup,
  restoreBackup,
};