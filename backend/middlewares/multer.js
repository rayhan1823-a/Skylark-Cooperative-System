const multer = require("multer");
const path = require("path");
const fs = require("fs");

// সুনির্দিষ্ট অ্যাবসোলিউট পাথ ব্যবহার করা যাতে রেন্ডার সার্ভারে কোনো কনফ্লিক্ট না হয়
const uploadDir = path.join(__dirname, "../uploads/videos");

// ফোল্ডার আছে কিনা বা ভুলবশত ফাইল হিসেবে আছে কিনা তা চেক করা
if (fs.existsSync(uploadDir)) {
  const stats = fs.statSync(uploadDir);
  if (!stats.isDirectory()) {
    // যদি ভুলবশত ফাইল হয়ে থাকে, তবে সেটি ডিলিট করে ফোল্ডার বানিয়ে দেবে
    fs.unlinkSync(uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} else {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ফোল্ডার না থাকলে যেন রানটাইমে ক্র্যাশ না করে সুরক্ষার জন্য
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
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
  limits: { fileSize: 500 * 1024 * 1024 }, // সর্বোচ্চ ৫০০ এমবি (500MB Limit)
});

module.exports = upload;