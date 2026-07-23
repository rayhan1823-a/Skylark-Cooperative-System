// ======================================
// Imports
// ======================================

const express = require("express");
const multer = require("multer");

// Controller
const backupController = require("../controllers/backupController");

console.log("========== BACKUP CONTROLLER ==========");
console.log(backupController);
console.log("=======================================");

const router = express.Router();

// ======================================
// Multer
// ======================================

const upload = multer({
  dest: "restore-temp/",
});

// ======================================
// Export Backup
// ======================================

router.get("/export", backupController.exportBackup);

// ======================================
// Restore Backup
// ======================================

router.post(
  "/restore",
  upload.single("backup"),
  async (req, res, next) => {
    console.log("========== RESTORE HIT ==========");
    console.log(req.file);

    try {
      await backupController.restoreBackup(req, res);
    } catch (err) {
      console.log("========== ROUTE ERROR ==========");
      console.log(err);
      next(err);
    }
  }
);

// ======================================
// Export Router
// ======================================

module.exports = router;