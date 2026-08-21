const Cheque = require("../models/chequeModel"); // আপনার মডেলের পাথ অনুযায়ী এটি ঠিক করে নেবেন
const mongoose = require("mongoose");

const ALLOWED_STATUS = ["Available", "Used", "Cancelled"];
const ALLOWED_USED_FOR = ["Loan", "Expense", "Withdrawal", "Other", ""];

// তারিখ পার্স করার হেল্পার ফাংশন
const parseDate = (dateVal) => {
  if (!dateVal) return null;
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// ১. সকল চেক লিস্ট বা ফিল্টার করে আনার জন্য
const getCheques = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = { isDeleted: false };

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.chequeNo = { $regex: search, $options: "i" };
    }

    const cheques = await Cheque.find(query)
      .populate("addedBy", "name role")
      .populate("usedBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: cheques,
    });
  } catch (error) {
    console.error("Get Cheques Error:", error);
    res.status(500).json({
      success: false,
      message: "চেক লিস্ট লোড করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ২. আইডি দিয়ে নির্দিষ্ট চেক দেখার জন্য
const getChequeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Cheque ID" });
    }

    const cheque = await Cheque.findOne({ _id: id, isDeleted: false })
      .populate("addedBy", "name role")
      .populate("usedBy", "name role");

    if (!cheque) {
      return res.status(404).json({ success: false, message: "চেকটি পাওয়া যায়নি" });
    }

    res.status(200).json({
      success: true,
      data: cheque,
    });
  } catch (error) {
    console.error("Get Cheque By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "চেকের তথ্য লোড করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৩. নতুন চেক যোগ করার জন্য
const addCheque = async (req, res) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Only Super Admin can add cheques." });
  }

  try {
    const { chequeNo, bankName, accountNo, status, issueDate, usedDate, usedFor, remarks, usedBy } = req.body;

    if (!chequeNo || !bankName || !accountNo) {
      return res.status(400).json({ success: false, message: "ચેক নম্বর, ব্যাংক নাম এবং অ্যাকাউন্ট নম্বর আবশ্যক।" });
    }

    const existingCheque = await Cheque.findOne({ chequeNo, isDeleted: false });
    if (existingCheque) {
      return res.status(400).json({ success: false, message: "এই চেক নম্বরটি ইতিপূর্বেই বিদ্যমান।" });
    }

    const chequeStatus = status || "Available";

    if (!ALLOWED_STATUS.includes(chequeStatus)) {
      return res.status(400).json({ success: false, message: "Invalid cheque status." });
    }

    const newCheque = new Cheque({
      chequeNo,
      bankName,
      accountNo,
      status: chequeStatus,
      issueDate: parseDate(issueDate),
usedDate: chequeStatus === "Used" ? parseDate(usedDate) : null,
      usedFor: chequeStatus === "Used" ? (usedFor || "") : "",
      usedBy: chequeStatus === "Used" ? (usedBy || null) : null,
      remarks: remarks || "",
      addedBy: req.user._id || req.user.id,
    });

    await newCheque.save();

    const populatedCheque = await Cheque.findById(newCheque._id)
      .populate("addedBy", "name role")
      .populate("usedBy", "name role");

    res.status(201).json({
      success: true,
      message: "চেক সফলভাবে যোগ করা হয়েছে",
      data: populatedCheque,
    });
  } catch (error) {
    console.error("Add Cheque Error:", error);
    res.status(500).json({
      success: false,
      message: "চেক যোগ করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৪. চেক আপডেট করা (Clean usedDate handling)
const updateCheque = async (req, res) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Only Super Admin can update cheques." });
  }

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Cheque ID" });
    }

    const cheque = await Cheque.findOne({ _id: id, isDeleted: false });
    if (!cheque) {
      return res.status(404).json({ success: false, message: "আপডেট করার জন্য চেকটি পাওয়া যায়নি" });
    }

    const { chequeNo, bankName, accountNo, status, issueDate, usedDate, usedFor, remarks, usedBy } = req.body;

    if (status !== undefined && !ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid cheque status." });
    }

    if (usedFor !== undefined && !ALLOWED_USED_FOR.includes(usedFor)) {
      return res.status(400).json({ success: false, message: "Invalid usedFor value." });
    }

    if (chequeNo !== undefined && chequeNo !== cheque.chequeNo) {
      const exists = await Cheque.findOne({
        chequeNo,
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Cheque number already exists.",
        });
      }
      cheque.chequeNo = chequeNo;
    }

    if (bankName !== undefined) cheque.bankName = bankName;
    if (accountNo !== undefined) cheque.accountNo = accountNo;

    if (status !== undefined) {
      cheque.status = status;
      if (status === "Used") {
        cheque.usedDate = usedDate !== undefined ? parseDate(usedDate) : cheque.usedDate || new Date();
        if (usedFor !== undefined) cheque.usedFor = usedFor || "";
        if (usedBy !== undefined) cheque.usedBy = usedBy || null;
      } else {
        cheque.usedDate = null;
        cheque.usedFor = "";
        cheque.usedBy = null;
      }
    } else {
      if (cheque.status === "Used") {
        if (usedFor !== undefined) cheque.usedFor = usedFor || "";
        if (usedBy !== undefined) cheque.usedBy = usedBy || null;
        if (usedDate !== undefined) cheque.usedDate = parseDate(usedDate);
      } else {
        cheque.usedFor = "";
        cheque.usedBy = null;
        cheque.usedDate = null;
      }
    }

    if (issueDate !== undefined) cheque.issueDate = parseDate(issueDate);
    if (remarks !== undefined) cheque.remarks = remarks;

    await cheque.save();

    const populatedUpdatedCheque = await Cheque.findById(cheque._id)
      .populate("addedBy", "name role")
      .populate("usedBy", "name role")
      .lean();

    res.status(200).json({
      success: true,
      message: "চেক সফলভাবে আপডেট হয়েছে",
      data: populatedUpdatedCheque,
    });
  } catch (error) {
    console.error("Update Cheque Error:", error);
    res.status(500).json({
      success: false,
      message: "চেক আপডেট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৫. চেক সফট ডিলিট করা (Standardized Clean Response)
const deleteCheque = async (req, res) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ success: false, message: "Only Super Admin can delete cheques." });
  }

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Cheque ID" });
    }

    const cheque = await Cheque.findOne({ _id: id, isDeleted: false });
    if (!cheque) {
      return res.status(404).json({ success: false, message: "ডিলিট করার জন্য চেকটি পাওয়া যায়নি" });
    }

    cheque.isDeleted = true;
    await cheque.save();

    res.status(200).json({
      success: true,
      message: "চেক সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    console.error("Delete Cheque Error:", error);
    res.status(500).json({
      success: false,
      message: "চেক ডিলিট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৬. একক এগ্রিগেশন কুয়েরি ব্যবহার করে ফাস্ট সামারি এপিআই
const getChequeSummary = async (req, res) => {
  try {
    const summary = await Cheque.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] },
          },
          used: {
            $sum: { $cond: [{ $eq: ["$status", "Used"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = summary[0] || { total: 0, available: 0, used: 0, cancelled: 0 };

    res.status(200).json({
      success: true,
      total: result.total,
      available: result.available,
      used: result.used,
      cancelled: result.cancelled,
    });
  } catch (error) {
    console.error("Get Cheque Summary Error:", error);
    res.status(500).json({
      success: false,
      message: "সামারি ডেটা লোড করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

module.exports = {
  getCheques,
  getChequeById,
  addCheque,
  updateCheque,
  deleteCheque,
  getChequeSummary,
};