const express = require("express");
const router = express.Router();

const {
    createMember,
    getAllMembers,
    getMemberProfile,
    updateMember,
    deleteMember,
    getDashboardStats,
    reorderMemberIds, // নতুন ফাংশন ইম্পোর্ট করা হলো
} = require("../controllers/memberController");

// ✅ সঠিক `uploadMemberFiles` ইম্পোর্ট
const {
    uploadMemberFiles,
} = require("../middlewares/upload");

// ✅ অথেন্টিকেশন ও রোল মিডলওয়্যার ইম্পোর্ট
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ১. স্ট্যাটিক রাউট (সবার উপরে থাকতে হবে) - শুধু লগইন করা ইউজাররা দেখতে পাবে
router.get("/dashboard/stats", authMiddleware, getDashboardStats);

// নতুন সংযোজন: মেম্বার আইডি রিঅর্ডার করার রাউট (ডায়নামিক আইডি রাউটের উপরে থাকতে হবে)
router.put("/reorder-ids", authMiddleware, roleMiddleware("SUPER_ADMIN"), reorderMemberIds);

// ২. সাধারণ কালেকশন রাউট
router.get("/", authMiddleware, getAllMembers);
// নতুন মেম্বার তৈরি শুধু Super Admin বা Staff করতে পারবে (আগের লজিক বহাল আছে)
router.post("/", authMiddleware, roleMiddleware("SUPER_ADMIN", "STAFF"), uploadMemberFiles, createMember);

// ৩. ডায়নামিক আইডি রাউট (সবার নিচে থাকবে) - সাধারণ মেম্বাররাও যেন নিজের প্রোফাইল দেখতে পারে সেজন্য 'MEMBER' রোল যুক্ত করা হলো
router.get("/:id", authMiddleware, roleMiddleware("SUPER_ADMIN", "ADMIN", "STAFF", "MEMBER"), getMemberProfile);

// মেম্বার আপডেট শুধুমাত্র Super Admin করতে পারবে (ADMIN বা অন্যদের এডিট করার পারমিশন বাদ দেওয়া হয়েছে)
router.put("/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), uploadMemberFiles, updateMember);

// মেম্বার ডিলিট শুধু Super Admin করতে পারবে
router.delete("/:id", authMiddleware, roleMiddleware("SUPER_ADMIN"), deleteMember);

module.exports = router;