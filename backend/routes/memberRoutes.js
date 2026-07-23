const express = require("express");
const router = express.Router();

const {
  createMember,
  getAllMembers,
  getMemberProfile,
  updateMember,
  deleteMember,
  getDashboardStats,
} = require("../controllers/memberController");

// ✅ সঠিক `uploadMemberFiles` ইম্পোর্ট
const {
  uploadMemberFiles,
} = require("../middlewares/upload");

// ✅ অথেন্টিকেশন ও রোল মিডলওয়্যার ইম্পোর্ট
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ১. স্ট্যাটিক রাউট (সবার উপরে থাকতে হবে) - শুধু লগইন করা ইউজাররা দেখতে পাবে
router.get("/dashboard/stats", authMiddleware, getDashboardStats);

// ২. সাধারণ কালেকশন রাউট
router.get("/", authMiddleware, getAllMembers);
// নতুন মেম্বার তৈরি শুধু Super Admin বা Staff করতে পারবে
router.post("/", authMiddleware, roleMiddleware("SUPER_ADMIN", "STAFF"), uploadMemberFiles, createMember);

// ৩. ডায়নামিক আইডি রাউট (সবার নিচে থাকবে)
router.get("/:id", authMiddleware, getMemberProfile);
// মেম্বার আপডেট শুধু Super Admin বা Staff করতে পারবে
router.put("/:id", authMiddleware, roleMiddleware("SUPER_ADMIN", "STAFF"), uploadMemberFiles, updateMember);
// মেম্বার ডিলিট শুধু Super Admin করতে পারবে
router.delete("/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), deleteMember);

module.exports = router;