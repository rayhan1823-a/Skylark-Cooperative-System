const mongoose = require("mongoose");

// ======================================
// Allocation Detail Schema
// ======================================

const allocationDetailSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    monthName: {
      type: String,
      required: true,
    },

    monthlyAmount: {
      type: Number,
      required: true,
    },

    allocatedAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Paid", "Partial"],
      default: "Paid",
    },
  },
  {
    _id: false,
  }
);

// ======================================
// Deposit Schema
// ======================================

const depositSchema = new mongoose.Schema(
  {
    // ======================================
    // Member
    // ======================================

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },

    // ======================================
    // Deposit Amount
    // ======================================

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================
    // Deposit Month (User Selected)
    // ======================================

    month: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    // ======================================
    // Enterprise Allocation
    // ======================================

    allocationMode: {
      type: String,
      enum: ["SINGLE", "AUTO"],
      default: "AUTO",
    },

    startMonth: {
      type: Number,
      default: null,
    },

    startYear: {
      type: Number,
      default: null,
    },

    allocationDetails: {
      type: [allocationDetailSchema],
      default: [],
    },

    lastAllocationAt: {
      type: Date,
      default: null,
    },

    allocationVersion: {
      type: Number,
      default: 1,
    },

    // ======================================
    // Receipt
    // ======================================

    receiptNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ======================================
    // Receipt Group
    // ======================================

    allocationGroup: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    // ======================================
    // Payment Method
    // ======================================

    paymentMethod: {
      type: String,
      default: "Cash",
      trim: true,
    },

    // ======================================
    // Note
    // ======================================

    note: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // Manual Deposit Date (User Input)
    // ======================================

    depositDate: {
      type: Date,
      default: Date.now,
    },

    // ======================================
    // Created By
    // ======================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "deposits",
  }
);

// ======================================
// Export
// ======================================

module.exports =
  mongoose.models.Deposit ||
  mongoose.model("Deposit", depositSchema);