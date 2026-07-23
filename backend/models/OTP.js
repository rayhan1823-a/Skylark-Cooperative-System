const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    // ===========================
    // User Email অথবা Phone
    // ===========================

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // ===========================
    // OTP Code
    // ===========================

    otp: {
      type: String,
      required: true,
    },

    // ===========================
    // OTP Type
    // email / phone
    // ===========================

    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },

    // ===========================
    // Verified
    // ===========================

    verified: {
      type: Boolean,
      default: false,
    },

    // ===========================
    // Attempts
    // ===========================

    attempts: {
      type: Number,
      default: 0,
    },

    // ===========================
    // Expire After 5 Minutes
    // ===========================

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ===========================
// Index
// ===========================

otpSchema.index({ email: 1 });

otpSchema.index({ phone: 1 });

module.exports = mongoose.model("OTP", otpSchema);