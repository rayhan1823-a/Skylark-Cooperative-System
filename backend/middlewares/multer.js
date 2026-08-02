const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ফোল্ডার না থাকলে স্বয়ংক্রিয়ভাবে তৈরি করার ব্যবস্থা
const uploadDir = "uploads/videos";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// শুধুমাত্র ভিডিও Allow
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("শুধুমাত্র ভিডিও আপলোড করা যাবে"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // সর্বোচ্চ ১০০ এমবি (প্রয়োজন অনুযায়ী কমাতে বা বাড়াতে পারেন)
});

module.exports = upload;