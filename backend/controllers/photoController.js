const Photo = require("../models/Photo");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const categories = require("../utils/categories");

// ১. সব অ্যাক্টিভ ছবি পাওয়ার জন্য (Get All Photos - with lean)
const getPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({ status: "Active" })
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: photos.length,
      data: photos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "সার্ভার ত্রুটি: ছবিগুলো লোড করা যায়নি",
      error: error.message,
    });
  }
};

// ২. নির্দিষ্ট আইডি দিয়ে একটি অ্যাক্টিভ ছবি পাওয়ার জন্য (Get Photo By ID - with lean)
const getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Photo ID.",
      });
    }

    const photo = await Photo.findOne({
      _id: id,
      status: "Active",
    })
      .populate("uploadedBy", "name role")
      .lean();

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "ছবিটি খুঁজে পাওয়া যায়নি",
      });
    }

    res.status(200).json({
      success: true,
      data: photo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ছবি লোড করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৩. নতুন ছবি যোগ করার জন্য (Add New Photo - Local & Cloudinary Ready)
const addPhoto = async (req, res) => {
  if (
    !req.user ||
    !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to upload photos.",
    });
  }

  try {
    const { title, category, date } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "ছবির শিরোনাম (Title) আবশ্যক।",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "ছবির ফাইল আপলোড করা বাধ্যতামূলক।",
      });
    }

    // Category Validation
    if (category && !categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    // Local + Cloudinary Support Flexible Path
    const imageUrl = req.file.path || `uploads/photos/${req.file.filename}`;

    const newPhoto = new Photo({
      title,
      category: category || "General",
      imageUrl: imageUrl,
      uploadedBy: req.user?._id || req.user?.id || null,
      date:
        date && !isNaN(new Date(date).getTime())
          ? new Date(date)
          : Date.now(),
    });

    const savedPhoto = await newPhoto.save();
    const populatedPhoto = await Photo.findById(savedPhoto._id)
      .populate("uploadedBy", "name role")
      .lean();

    res.status(201).json({
      success: true,
      message: "ছবি সফলভাবে যুক্ত হয়েছে",
      data: populatedPhoto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ছবি সংরক্ষণ করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৪. ছবি আপডেট করার জন্য (Update Photo & Safe Async Delete Old File)
const updatePhoto = async (req, res) => {
  if (
    !req.user ||
    !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update photos.",
    });
  }

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Photo ID.",
      });
    }

    const { title, category, date } = req.body;

    const photo = await Photo.findOne({
      _id: id,
      status: "Active",
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "আপডেট করার জন্য ছবিটি খুঁজে পাওয়া যায়নি",
      });
    }

    if (category && !categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    if (title !== undefined) photo.title = title;
    if (category !== undefined) photo.category = category;
    
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        photo.date = parsedDate;
      }
    }

    // যদি নতুন ছবি আপলোড করা হয়, তবে পুরনো ছবির অস্তিত্ব চেক করে সেফলি ডিলিট হবে
    if (req.file) {
      if (photo.imageUrl && !photo.imageUrl.startsWith("http")) {
        const oldImage = path.join(__dirname, "..", photo.imageUrl);

        fs.unlink(oldImage, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Old image delete error:", err);
          }
        });
      }

      photo.imageUrl = req.file.path || `uploads/photos/${req.file.filename}`;
    }

    const updatedPhoto = await photo.save();
    const populatedUpdatedPhoto = await Photo.findById(updatedPhoto._id)
      .populate("uploadedBy", "name role")
      .lean();

    res.status(200).json({
      success: true,
      message: "ছবি সফলভাবে আপডেট হয়েছে",
      data: populatedUpdatedPhoto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ছবি আপডেট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৫. ছবি ডিলিট করার জন্য (Soft Delete with runValidators & Safe Async Remove File)
const deletePhoto = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can delete photos.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Photo ID.",
      });
    }

    const deletedPhoto = await Photo.findOneAndUpdate(
      {
        _id: id,
        status: "Active",
      },
      {
        status: "Deleted",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deletedPhoto) {
      return res.status(404).json({
        success: false,
        message: "ডিলিট করার জন্য বা অ্যাক্টিভ অবস্থায় ছবিটি খুঁজে পাওয়া যায়নি",
      });
    }

    // সার্ভার থেকেও ছবির অস্তিত্ব চেক করে সেফলি রিমুভ করা (লোকাল ফাইল হলে)
    if (deletedPhoto.imageUrl && !deletedPhoto.imageUrl.startsWith("http")) {
      const imagePath = path.join(__dirname, "..", deletedPhoto.imageUrl);

      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Image delete error:", err);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "ছবি এবং সার্ভার ফাইল সফলভাবে মুছে ফেলা হয়েছে",
      data: deletedPhoto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ছবি ডিলিট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

module.exports = {
  getPhotos,
  getPhotoById,
  addPhoto,
  updatePhoto,
  deletePhoto,
};