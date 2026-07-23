const express = require("express");

const router = express.Router();

// ======================================
// Controllers
// ======================================

const {
  addMember,
  getMembers,
  getMember,
  getMemberProfile,
  updateMember,
  deleteMember,
  getDashboardStats,
} = require("../controllers/memberController");

// ======================================
// Upload Middleware
// ======================================

const {
  uploadMemberFiles,
} = require("../middlewares/upload");

// ======================================
// Dashboard Statistics
// ======================================

router.get(
  "/dashboard/stats",
  getDashboardStats
);

// ======================================
// Get Member Profile
// ======================================

router.get(
  "/profile/:id",
  getMemberProfile
);

// ======================================
// Get All Members
// ======================================

router.get(
  "/",
  getMembers
);

// ======================================
// Add Member
// ======================================

router.post(
  "/",
  uploadMemberFiles,
  addMember
);

// ======================================
// Update Member
// ======================================

router.put(
  "/:id",
  uploadMemberFiles,
  updateMember
);

// ======================================
// Delete Member
// ======================================

router.delete(
  "/:id",
  deleteMember
);

// ======================================
// Get Single Member
// (Always keep at last)
// ======================================

router.get(
  "/:id",
  getMember
);

// ======================================
// Export
// ======================================

module.exports = router;