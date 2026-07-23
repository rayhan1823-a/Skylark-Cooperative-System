const multer = require("multer");
const path = require("path");

// Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    if (file.fieldname === "photo") {
      cb(null, "uploads/photos");
    }

    else if (file.fieldname === "nidFile") {
      cb(null, "uploads/nid");
    }

    else if (file.fieldname === "signature") {
      cb(null, "uploads/signatures");
    }

  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1000000) +
        path.extname(file.originalname)
    );

  },
});

// File Filter
const fileFilter = (req, file, cb) => {

  const allowed =
    /jpg|jpeg|png|pdf/;

  const ext =
    path.extname(file.originalname).toLowerCase();

  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG PNG PDF Allowed"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
});