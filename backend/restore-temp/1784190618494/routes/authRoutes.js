const express = require("express");

const router = express.Router();

// ======================================
// Controllers
// ======================================

const {
  register,
  login,
} = require("../controllers/authController");

// ======================================
// Middlewares
// ======================================

const authMiddleware = require("../middlewares/authMiddleware");

const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// Login
// Public Access
// ======================================

router.post("/login", login);

// ======================================
// Register User
// Only SUPER_ADMIN
// ======================================

router.post(
  "/register",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  register
);

// ======================================
// Export
// ======================================

module.exports = router;