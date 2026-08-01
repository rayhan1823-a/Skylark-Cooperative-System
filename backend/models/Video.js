const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Meeting",
        "Tutorial",
        "Foundation Anniversary",
        "Annual Picnic",
        "Cultural Program",
        "Prize Giving",
        "Event",
        "General",
      ],
      default: "Meeting",
      required: true,
    },

    type: {
      type: String,
      enum: ["youtube", "upload"],
      default: "youtube",
      required: true,
    },

    youtubeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    embedId: {
      type: String,
      default: "",
      trim: true,
    },

    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Video", videoSchema);