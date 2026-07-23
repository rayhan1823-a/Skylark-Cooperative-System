// ======================================
// Imports
// ======================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================
// Restore Temp Folder
// ======================================

const uploadFolder = path.join(
  __dirname,
  "../restore-temp"
);

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}

// ======================================
// Storage
// ======================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },

  filename: (req, file, cb) => {

    const fileName =
      "restore-" +
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000) +
      path.extname(file.originalname);

    cb(null, fileName);

  },

});

// ======================================
// ZIP File Filter
// ======================================

const fileFilter = (req, file, cb) => {

  const extension =
    path.extname(file.originalname).toLowerCase();

  if (extension !== ".zip") {

    return cb(
      new Error("Only ZIP backup files are allowed."),
      false
    );

  }

  cb(null, true);

};

// ======================================
// Upload Middleware
// ======================================

const uploadBackup = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },

});

// ======================================
// Export
// ======================================

module.exports = uploadBackup;