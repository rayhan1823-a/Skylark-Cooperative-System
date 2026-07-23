const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/settingsController");

const authMiddleware = require("../middlewares/authMiddleware");

// ======================================
// Profile
// ======================================

// Get Profile
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// Update Profile
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// ======================================
// Change Password
// ======================================

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// ======================================
// Export
// ======================================

module.exports = router;