// ======================================
// Imports
// ======================================

const express = require("express");
const router = express.Router();

const {
  exportBackup,
  restoreBackup,
} = require("../controllers/backupController");

// Upload Middleware
const uploadBackup = require("../middlewares/uploadBackup");

// Authentication Middleware (Later)
// const { verifyToken, isSuperAdmin } = require("../middlewares/authMiddleware");

// ======================================
// Export Backup
// GET /api/backup/export
// ======================================

router.get(
  "/export",

  // verifyToken,
  // isSuperAdmin,

  exportBackup
);

// ======================================
// Restore Backup
// POST /api/backup/restore
// FormData:
// backup : ZIP File
// ======================================

router.post(
  "/restore",

  // verifyToken,
  // isSuperAdmin,

  uploadBackup.single("backup"),

  restoreBackup
);

// ======================================
// Export Router
// ======================================

module.exports = router;