const express = require("express");

const router = express.Router();

// ======================================
// Controllers
// ======================================

const {
  createDeposit,
  getDeposits,
  getMemberDeposits,
  getDeposit,
  updateDeposit,
  deleteDeposit,
} = require("../controllers/depositController");

// ======================================
// Middlewares
// ======================================

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// Create Deposit
// ======================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  createDeposit
);

// ======================================
// Get All Deposits
// ======================================

router.get(
  "/",
  authMiddleware,
  getDeposits
);

// ======================================
// Member Deposit History
// (Temporary without auth)
// ======================================

router.get(
  "/member/:id",
  getMemberDeposits
);

// ======================================
// Receipt
// ======================================

router.get(
  "/receipt/:id",
  authMiddleware,
  getDeposit
);

// ======================================
// Single Deposit
// ======================================

router.get(
  "/:id",
  authMiddleware,
  getDeposit
);

// ======================================
// Update Deposit
// ======================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  updateDeposit
);

// ======================================
// Delete Deposit
// ======================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  deleteDeposit
);

module.exports = router;