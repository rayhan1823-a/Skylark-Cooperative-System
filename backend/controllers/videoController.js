const Video = require("../models/Video");
const mongoose = require("mongoose");

// ক্যাটাগরি লিস্ট
const categories = [
  "Meeting",
  "Tutorial",
  "Foundation Anniversary",
  "Annual Picnic",
  "Cultural Program",
  "Prize Giving",
  "Event",
  "General",
];

// YouTube URL থেকে নিখুঁতভাবে Embed ID এক্সট্রাক্ট করার হেল্পার ফাংশন
const getEmbedId = (url = "") => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/i
  );

  return match ? match[1] : "";
};

// ১. সব অ্যাক্টিভ ভিডিও পাওয়ার জন্য (Get All Videos)
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ status: "Active" })
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "সার্ভার ত্রুটি: ভিডিওগুলো লোড করা যায়নি",
      error: error.message,
    });
  }
};

// ২. নির্দিষ্ট আইডি দিয়ে একটি অ্যাক্টিভ ভিডিও পাওয়ার জন্য (Get Video By ID)
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    // ইনভ্যালিড আইডি চেক
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Video ID.",
      });
    }
    
    const video = await Video.findOne({
      _id: id,
      status: "Active",
    }).populate("uploadedBy", "name role");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "ভিডিওটি খুঁজে পাওয়া যায়নি",
      });
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ভিডিও লোড করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৩. নতুন ভিডিও যোগ করার জন্য (Add New Video)
const addVideo = async (req, res) => {
  if (
    !req.user ||
    !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to upload videos.",
    });
  }

  try {
    const { title, category, type, youtubeUrl, date } = req.body;
    let uploadedVideoUrl = "";
    if (req.file) {
      uploadedVideoUrl = `uploads/videos/${req.file.filename}`;
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "ভিডিওর শিরোনাম (Title) আবশ্যক।",
      });
    }

    // Category Validation
    if (category && !categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    // Type Validation
    if (type && !["youtube", "upload"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video type.",
      });
    }

    if (type === "youtube" && !youtubeUrl) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required.",
      });
    }

    if (type === "upload" && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required.",
      });
    }

    // Universal getEmbedId Function Call
    const finalEmbedId = getEmbedId(youtubeUrl);

    const newVideo = new Video({
      title,
      category: category || "Meeting",
      type: type || "youtube",
      youtubeUrl: youtubeUrl || "",
      embedId: finalEmbedId,
      videoUrl: uploadedVideoUrl,
      uploadedBy: req.user && req.user.id ? req.user.id : null,
      date: date ? new Date(date) : Date.now(),
    });

    const savedVideo = await newVideo.save();
    const populatedVideo = await Video.findById(savedVideo._id).populate("uploadedBy", "name role");

    res.status(201).json({
      success: true,
      message: "ভিডিও সফলভাবে যুক্ত হয়েছে",
      data: populatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ভিডিও সংরক্ষণ করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৪. ভিডিও আপডেট করার জন্য (Update Video)
const updateVideo = async (req, res) => {
  if (
    !req.user ||
    !["SUPER_ADMIN", "ADMIN", "STAFF"].includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update videos.",
    });
  }

  try {
    const { id } = req.params;

    // Invalid ObjectId Check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Video ID.",
      });
    }

    const { title, category, type, youtubeUrl, date } = req.body;

    const video = await Video.findOne({
      _id: id,
      status: "Active",
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "আপডেট করার জন্য ভিডিওটি খুঁজে পাওয়া যায়নি",
      });
    }

    // Category Validation
    if (category && !categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    // Type Validation
    if (type && !["youtube", "upload"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video type.",
      });
    }

    if (title !== undefined) video.title = title;
    if (category !== undefined) video.category = category;
    if (type !== undefined) video.type = type;
    
    if (youtubeUrl !== undefined) {
      video.youtubeUrl = youtubeUrl;
      video.embedId = getEmbedId(youtubeUrl);
    }

    if (req.file) {
      video.videoUrl = `uploads/videos/${req.file.filename}`;
      video.youtubeUrl = "";
      video.embedId = "";
    }

    if (date !== undefined) video.date = new Date(date);

    if (video.type === "youtube" && !video.youtubeUrl) {
      return res.status(400).json({
        success: false,
        message: "YouTube URL is required.",
      });
    }

    if (video.type === "upload" && !video.videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video file is required.",
      });
    }

    const updatedVideo = await video.save();
    const populatedUpdatedVideo = await Video.findById(updatedVideo._id).populate("uploadedBy", "name role");

    res.status(200).json({
      success: true,
      message: "ভিডিও সফলভাবে আপডেট হয়েছে",
      data: populatedUpdatedVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ভিডিও আপডেট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৫. ভিডিও ডিলিট করার জন্য (Soft Delete - Only SUPER_ADMIN)
const deleteVideo = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can delete videos.",
      });
    }

    const { id } = req.params;

    // Invalid ObjectId Check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Video ID.",
      });
    }

    const deletedVideo = await Video.findOneAndUpdate(
      {
        _id: id,
        status: "Active",
      },
      {
        status: "Deleted",
      },
      {
        new: true,
      }
    );

    if (!deletedVideo) {
      return res.status(404).json({
        success: false,
        message: "ডিলিট করার জন্য বা অ্যাক্টিভ অবস্থায় ভিডিওটি খুঁজে পাওয়া যায়নি",
      });
    }

    res.status(200).json({
      success: true,
      message: "ভিডিও সফলভাবে মুছে ফেলা হয়েছে",
      data: deletedVideo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ভিডিও ডিলিট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

module.exports = {
  getVideos,
  getVideoById,
  addVideo,
  updateVideo,
  deleteVideo,
};