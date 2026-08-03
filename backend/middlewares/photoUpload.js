const multer = require("multer");
const path = require("path");
const fs = require("fs");

console.log("✅ Photo Upload Middleware Loaded");
console.log("📷 Upload Limit:", 10 * 1024 * 1024);

// ======================================
// Upload Directory
// ======================================

const uploadDir = path.join(__dirname, "../uploads/photos");

// Folder Create (if not exists)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  const stats = fs.statSync(uploadDir);

  if (!stats.isDirectory()) {
    fs.unlinkSync(uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// ======================================
// Storage Configuration
// ======================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
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

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, JPEG, PNG and WEBP image files are allowed."
    ),
    false
  );
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

module.exports = photoUpload;