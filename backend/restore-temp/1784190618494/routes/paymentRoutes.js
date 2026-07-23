// ======================================
// Imports
// ======================================

const express = require("express");
const router = express.Router();

const {
  createPayment,
  getPayments,
  getMemberPayments,
  getPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// Create Payment
// SUPER_ADMIN + STAFF
// ======================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  createPayment
);

// ======================================
// Get All Payments
// Any Logged-in User
// ======================================

router.get(
  "/",
  authMiddleware,
  getPayments
);

// ======================================
// Get Member Payment History
// Any Logged-in User
// ======================================

router.get(
  "/member/:memberId",
  authMiddleware,
  getMemberPayments
);

// ======================================
// Get Single Payment
// Any Logged-in User
// ======================================

router.get(
  "/:id",
  authMiddleware,
  getPayment
);

// ======================================
// Update Payment
// SUPER_ADMIN + STAFF
// ======================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  updatePayment
);

// ======================================
// Delete Payment
// SUPER_ADMIN ONLY
// ======================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  deletePayment
);

// ======================================
// Export
// ======================================

module.exports = router;