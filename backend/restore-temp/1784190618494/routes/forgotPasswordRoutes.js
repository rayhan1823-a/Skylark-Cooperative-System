// ======================================
// Imports
// ======================================

const express = require("express");
const router = express.Router();

const {
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/forgotPasswordController");

// ======================================
// Send OTP
// Email / Phone
// ======================================

router.post(
  "/send-otp",
  sendOTP
);

// ======================================
// Verify OTP
// ======================================

router.post(
  "/verify-otp",
  verifyOTP
);

// ======================================
// Reset Password
// ======================================

router.post(
  "/reset-password",
  resetPassword
);

// ======================================
// Export
// ======================================

module.exports = router;