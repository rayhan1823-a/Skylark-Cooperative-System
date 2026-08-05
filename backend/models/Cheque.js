const mongoose = require("mongoose");

const chequeSchema = new mongoose.Schema(
  {
    chequeNo: {
      type: String,
      required: [true, "Cheque number is required"],
      trim: true,
      index: true,
      // আগের গ্লোবাল unique: true বাদ দেওয়া হয়েছে যাতে সফট ডিলিট হওয়া চেক নম্বর রিইউজ করা যায়
    },
    bankName: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    accountNo: {
      type: String,
      required: [true, "Account number is required"],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Available", "Used", "Cancelled"],
      default: "Available",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    issueDate: {
      type: Date,
      default: null,
    },
    usedDate: {
      type: Date,
      default: null,
    },
    usedFor: {
      type: String,
      enum: [
        "",
        "Deposit",
        "Loan",
        "Withdrawal",
        "Investment",
        "Office Expense",
        "Other",
      ],
      default: "",
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ⭐ Partial Unique Index: শুধুমাত্র active (isDeleted: false) চেকগুলোর ক্ষেত্রে chequeNo ইউনিক হবে।
// এর ফলে সফট ডিলিট হওয়া চেক নম্বর ডাটাবেজে থাকলেও নতুন করে আবার একই নম্বর যোগ করা সম্ভব হবে।
chequeSchema.index(
  { chequeNo: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Compound Index for Performance (Including isDeleted)
chequeSchema.index({
  isDeleted: 1,
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Cheque", chequeSchema);