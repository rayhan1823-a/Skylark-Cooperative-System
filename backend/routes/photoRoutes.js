const express = require("express");
const router = express.Router();

const {
  getPhotos,
  getPhotoById,
  addPhoto,
  updatePhoto,
  deletePhoto,
} = require("../controllers/photoController");

const photoUpload = require("../middlewares/photoUpload");
const verifyToken = require("../middlewares/authMiddleware"); // আপনার অথেনটিকেশন মিডলওয়্যার

// Route chaining for '/'
router
  .route("/")
  .get(getPhotos)
  .post(verifyToken, photoUpload.single("image"), addPhoto);

// Route chaining for '/:id'
router
  .route("/:id")
  .get(getPhotoById)
  .put(verifyToken, photoUpload.single("image"), updatePhoto)
  .delete(verifyToken, deletePhoto);

module.exports = router;