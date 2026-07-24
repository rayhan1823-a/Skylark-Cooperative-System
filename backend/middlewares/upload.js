const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ======================================
// Cloudinary Configuration
// ======================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ======================================
// Cloudinary Storage Setup (Replacing diskStorage)
// ======================================

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // আগের ফোল্ডার স্ট্রাকচারের নাম অনুযায়ী ক্লাউডিনারিতে ফোল্ডার নির্ধারণ
    let folderName = "skylark-cooperative/photos";

    if (file.fieldname === "nidFile") folderName = "skylark-cooperative/nid";
    else if (file.fieldname === "signature") folderName = "skylark-cooperative/signatures";
    else if (file.fieldname === "nomineePhoto") folderName = "skylark-cooperative/nominee";
    else if (file.fieldname === "nomineeNid") folderName = "skylark-cooperative/nominee-nid";

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000000);

    return {
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      public_id: uniqueName,
    };
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