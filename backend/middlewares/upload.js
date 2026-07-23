const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================
// Upload Directories
// ======================================

const uploadDirs = {
  photo: path.join(__dirname, "../uploads/photos"),
  nidFile: path.join(__dirname, "../uploads/nid"),
  signature: path.join(__dirname, "../uploads/signatures"),
  nomineePhoto: path.join(__dirname, "../uploads/nominee"),
  nomineeNid: path.join(__dirname, "../uploads/nominee-nid"),
};

// Create folders if not exists
Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ======================================
// Multer Storage
// ======================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      uploadDirs[file.fieldname] || uploadDirs.photo
    );
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000000) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ======================================
// Allowed File Types
// ======================================

const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// ======================================
// File Filter
// ======================================

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and PDF files are allowed."
      ),
      false
    );
  }
};

// ======================================
// Upload Configuration
// ======================================

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
});

// ======================================
// Upload Fields
// ======================================

const uploadMemberFiles = upload.fields([
  {
    name: "photo",
    maxCount: 1,
  },
  {
    name: "nidFile",
    maxCount: 1,
  },
  {
    name: "signature",
    maxCount: 1,
  },
  {
    name: "nomineePhoto",
    maxCount: 1,
  },
  {
    name: "nomineeNid",
    maxCount: 1,
  },
]);

// ======================================
// Export
// ======================================

module.exports = {
  upload,
  uploadMemberFiles,
};