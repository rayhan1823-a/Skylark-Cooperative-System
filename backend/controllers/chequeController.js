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
      return res.status(404).json({ success: false, message: "আপডেট করার জন্য চেকটি পাওয়া যায়নি" });
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
      message: "চেক সফলভাবে আপডেট হয়েছে",
      data: populatedUpdatedCheque,
    });
  } catch (error) {
    console.error("Update Cheque Error:", error);
    res.status(500).json({
      success: false,
      message: "চেক আপডেট করতে সমস্যা হয়েছে",
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
      return res.status(404).json({ success: false, message: "ডিলিট করার জন্য চেকটি পাওয়া যায়নি" });
    }

    cheque.isDeleted = true;
    await cheque.save();

    res.status(200).json({
      success: true,
      message: "চেক সফলভাবে মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    console.error("Delete Cheque Error:", error);
    res.status(500).json({
      success: false,
      message: "চেক ডিলিট করতে সমস্যা হয়েছে",
      error: error.message,
    });
  }
};

// ৬. একক এগ্রিগেশন কুয়েরি ব্যবহার করে ফাস্ট সামারি এপিআই
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
      message: "সামারি ডেটা লোড করতে সমস্যা হয়েছে",
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