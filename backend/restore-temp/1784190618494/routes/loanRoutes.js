const express = require("express");
const router = express.Router();

const {
  createLoan,
  getLoans,
  getLoan,
  updateLoan,
  deleteLoan,
  getMemberLoans,
} = require("../controllers/loanController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// Add Loan
// SUPER_ADMIN + STAFF
// ======================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  createLoan
);

// ======================================
// Get All Loans
// ======================================

router.get(
  "/",
  authMiddleware,
  getLoans
);

// ======================================
// Get Member Loan History
// ======================================

router.get(
  "/member/:memberId",
  authMiddleware,
  getMemberLoans
);

// ======================================
// Get Single Loan
// ======================================

router.get(
  "/:id",
  authMiddleware,
  getLoan
);

// ======================================
// Update Loan
// SUPER_ADMIN + STAFF
// ======================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  updateLoan
);

// ======================================
// Delete Loan
// SUPER_ADMIN Only
// ======================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  deleteLoan
);

// ======================================
// Export
// ======================================

module.exports = router;