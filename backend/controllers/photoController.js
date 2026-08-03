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
    console.log("========== ADD PHOTO ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

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
    console.error("========== PHOTO UPLOAD ERROR ==========");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: "ছবি সংরক্ষণ করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};