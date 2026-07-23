// ======================================
// Imports
// ======================================
const express = require("express");
const router = express.Router();

// ======================================
// Controllers
// ======================================
const {
  createLoan,
  getLoans,
  getLoan,
  getLoanReceipt,
  updateLoan,
  deleteLoan,
  getMemberLoans,
} = require("../controllers/loanController");

// ======================================
// Middlewares
// ======================================
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// Add Loan (SUPER_ADMIN & ADMIN)
// ======================================
router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
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
// Get Member Loan History (Dynamic route)
// ======================================
router.get(
  "/member/:memberId",
  authMiddleware,
  getMemberLoans
);

// ======================================
// Get Single Loan Receipt (Dynamic route - placed before /:id)
// ======================================
router.get(
  "/receipt/:id",
  authMiddleware,
  getLoanReceipt
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
// Update Loan (SUPER_ADMIN & ADMIN)
// ======================================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  updateLoan
);

// ======================================
// Delete Loan (শুধুমাত্র SUPER_ADMIN)
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