// ======================================
// Imports
// ======================================

const express = require("express");

const router = express.Router();

const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changePassword, // ✅ পাসওয়ার্ড পরিবর্তনের কন্ট্রোলার ইমপোর্ট করা হলো
} = require("../controllers/userController");

// ✅ Fixed Path
const authMiddleware = require("../middlewares/authMiddleware");

const roleMiddleware = require("../middlewares/roleMiddleware");

// ======================================
// All Routes Require Login
// ======================================

router.use(authMiddleware);

// ======================================
// Change Password (Any logged-in user can change their password)
// PUT /api/users/change-password
// ======================================
router.put(
  "/change-password",
  changePassword
);

// ======================================
// Get All Users
// SUPER_ADMIN Only
// GET /api/users
// ======================================

router.get(
  "/",
  roleMiddleware("SUPER_ADMIN"),
  getUsers
);

// ======================================
// Create Staff
// SUPER_ADMIN Only
// POST /api/users
// ======================================

router.post(
  "/",
  roleMiddleware("SUPER_ADMIN"),
  createUser
);

// ======================================
// Get Single User
// SUPER_ADMIN Only
// GET /api/users/:id
// ======================================

router.get(
  "/:id",
  roleMiddleware("SUPER_ADMIN"),
  getUser
);

// ======================================
// Update User
// SUPER_ADMIN Only
// PUT /api/users/:id
// ======================================

router.put(
  "/:id",
  roleMiddleware("SUPER_ADMIN"),
  updateUser
);

// ======================================
// Delete User
// SUPER_ADMIN Only
// DELETE /api/users/:id
// ======================================

router.delete(
  "/:id",
  roleMiddleware("SUPER_ADMIN"),
  deleteUser
);

// ======================================
// Export
// ======================================

module.exports = router;