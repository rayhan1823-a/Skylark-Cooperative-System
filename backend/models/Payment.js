const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ======================================
    // Member
    // ======================================
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: [true, "Member is required"],
      index: true,
    },

    // ======================================
    // Amount
    // ======================================
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Amount must be greater than zero"],
    },

    // ======================================
    // Receipt Number
    // ======================================
    receiptNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ======================================
    // Payment Date
    // ======================================
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    // ======================================
    // Payment Method
    // ======================================
    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Bank",
        "Mobile Banking",
        "Cheque",
      ],
      default: "Cash",
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
    // Remarks
    // ======================================
    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // Received By
    // ======================================
    receivedBy: {
      type: String,
      default: "Admin",
      trim: true,
    },

    // ======================================
    // Penalty Waiver
    // ======================================
    penaltyWaiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ======================================
// Indexes
// ======================================

// Member Payment History
paymentSchema.index({
  member: 1,
  paymentDate: -1,
});

// Latest Payments
paymentSchema.index({
  createdAt: -1,
});

// ======================================
// Export
// ======================================

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);