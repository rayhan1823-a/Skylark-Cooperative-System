const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

console.log("✅ Photo Upload Middleware Loaded");
console.log("☁️ Using Cloudinary Storage");
console.log("📷 Upload Limit:", 10 * 1024 * 1024);

// ======================================
// Cloudinary Configuration
// ======================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================================
// Cloudinary Storage
// ======================================

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1000000000);

    return {
      folder: "skylark-cooperative/gallery",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: uniqueName,
    };
  },
});

// ======================================
// Allowed Image Types
// ======================================

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ======================================
// File Filter
// ======================================

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, JPEG, PNG and WEBP image files are allowed."),
      false
    );
  }
};

// ======================================
// Multer Configuration
// ======================================

const photoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// ======================================
// Export
// ======================================

module.exports = photoUpload;