const express = require("express");
const router = express.Router();

const {
  getVideos,
  getVideoById,
  addVideo,
  updateVideo,
  deleteVideo,
} = require("../controllers/videoController");

const verifyToken = require("../middlewares/authMiddleware");

// Public Routes (সবার জন্য উন্মুক্ত)
router.get("/", getVideos);
router.get("/:id", getVideoById);

// Protected Routes (অথেন্টিকেশন ও রোল চেক সহ)
router.post("/", verifyToken, addVideo);
router.put("/:id", verifyToken, updateVideo);
router.delete("/:id", verifyToken, deleteVideo);

module.exports = router;