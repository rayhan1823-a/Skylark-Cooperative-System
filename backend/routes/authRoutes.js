const express = require("express");
const router = express.Router();

// ======================================
// Controllers
// ======================================
const {
  register,
  login,
  changePassword, // ✅ পাসওয়ার্ড পরিবর্তনের কন্ট্রোলার যুক্ত করা হলো
} = require("../controllers/authController");

const User = require("../models/User"); // ✅ ইউজার মডেল যুক্ত করা হলো প্রোফাইল ডেটা আনতে

// ======================================
// Middlewares
// ======================================
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// Login (Public Access)
// ======================================
router.post("/login", login);

// ======================================
// Register User (Public Access/Open)
// ======================================
router.post("/register", register);

// ======================================
// Get Logged-in User Profile (Protected Route)
// ======================================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// ======================================
// Change Password (Protected Route)
// ======================================
router.put("/change-password", authMiddleware, changePassword);

// ======================================
// Export
// ======================================
module.exports = router;