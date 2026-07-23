// ======================================
// Imports
// ======================================

const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/paymentController");

const {
  getMemberAllocation,
} = require("../controllers/paymentAllocationController");

// ======================================
// Middlewares
// ======================================

const authMiddleware = require("../middlewares/authMiddleware");

const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// Create Payment
// ======================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  paymentController.createPayment
);

// ======================================
// Get All Payments
// ======================================

router.get(
  "/",
  authMiddleware,
  paymentController.getPayments
);

// ======================================
// Get Member Payments
// ======================================

router.get(
  "/member/:memberId",
  authMiddleware,
  paymentController.getMemberPayments
);

// ======================================
// Allocation
// ======================================

router.get(
  "/allocation/:id",
  authMiddleware,
  getMemberAllocation
);

// ======================================
// Get Single Payment
// ======================================

router.get(
  "/:id",
  authMiddleware,
  paymentController.getPayment
);

// ======================================
// Update Payment
// ======================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "STAFF"),
  paymentController.updatePayment
);

// ======================================
// Delete Payment
// ======================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  paymentController.deletePayment
);

// ======================================
// Export
// ======================================

module.exports = router;