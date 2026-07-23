const mongoose = require("mongoose");

const depositRateSchema = new mongoose.Schema(
  {
    // ======================================
    // From Year & Month
    // ======================================
    fromYear: {
      type: Number,
      required: [true, "From year is required"],
      min: 2023,
      max: 2100,
      index: true,
    },

    fromMonth: {
      type: Number,
      required: [true, "From month is required"],
      min: 1,
      max: 12,
    },

    // ======================================
    // To Year & Month
    // ======================================
    toYear: {
      type: Number,
      required: [true, "To year is required"],
      min: 2023,
      max: 2100,
      index: true,
    },

    toMonth: {
      type: Number,
      required: [true, "To month is required"],
      min: 1,
      max: 12,
    },

    // ======================================
    // Monthly Amount
    // ======================================
    monthlyAmount: {
      type: Number,
      required: [true, "Monthly amount is required"],
      min: [1, "Monthly amount must be greater than zero"],
    },
  },
  {
    timestamps: true,
    versionKey: false,

    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        return ret;
      },
    },

    toObject: {
      virtuals: true,
    },
  }
);

// ======================================
// Additional Indexes
// ======================================

// একই Rate Range যেন একবারই থাকে
depositRateSchema.index(
  {
    fromYear: 1,
    fromMonth: 1,
    toYear: 1,
    toMonth: 1,
  },
  {
    unique: true,
  }
);

// ======================================
// Export Model
// ======================================

module.exports = mongoose.model(
  "DepositRate",
  depositRateSchema
);