const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
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
        "Collection",
        "Foundation Anniversary",
        "Annual Picnic",
        "Cultural Program",
        "Prize Giving",
        "Event",
        "General",
      ],
      default: "General",
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
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
      index: true,
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

// Compound Index (Filter + Sort Performance)
photoSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Photo", photoSchema);