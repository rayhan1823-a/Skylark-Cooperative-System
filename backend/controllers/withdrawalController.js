const Withdrawal = require("../models/Withdrawal");
const Member = require("../models/Member");

// ১. সকল উইথড্রয়াল হিস্ট্রি ডাটাবেজ থেকে ফেচ করা
exports.getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("memberId", "name memberId") // মেম্বারের নাম ও আইডি পপুলেট করবে
      .sort({ createdAt: -1 });

    // ফ্রন্টএন্ডের সুবিধার জন্য ফরম্যাট করে পাঠানো (receiptNo সহ)
    const formattedWithdrawals = withdrawals.map((item) => ({
      _id: item._id,
      receiptNo: item.receiptNo || "SKY-DW-000001",
      amount: item.amount,
      date: item.date,
      note: item.note,
      member: {
        name: item.memberId?.name || "Unknown Member",
        memberId: item.memberId?.memberId || "",
      },
    }));

    res.status(200).json({
      success: true,
      count: formattedWithdrawals.length,
      withdrawals: formattedWithdrawals,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};

// ২. নতুন উইথড্রয়াল ডাটাবেজে সেভ করা এবং অটো রিসিট জেনারেট করা
exports.createWithdrawal = async (req, res) => {
  try {
    const { memberId, amount, date, note } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Member ID and withdrawal amount are required." 
      });
    }

    const withdrawAmount = Number(amount);
    if (withdrawAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Withdrawal amount must be greater than zero." 
      });
    }

    // অটো রিসিট নম্বর জেনারেট করা (যেমন: SKY-DW-000001)
    const count = await Withdrawal.countDocuments();
    const receiptNo = `SKY-DW-${String(count + 1).padStart(6, "0")}`;

    // মেম্বার চেক এবং ব্যালেন্স আপডেট (যদি প্রয়োজন হয়)
    const member = await Member.findById(memberId);
    if (member) {
      member.currentBalance = (member.currentBalance || 0) - withdrawAmount;
      member.totalWithdrawal = (member.totalWithdrawal || 0) + withdrawAmount;
      await member.save();
    }

    // ডাটাবেজে নতুন উইথড্রয়াল এবং রিসিট নম্বর সেভ করা হচ্ছে
    const newWithdrawal = await Withdrawal.create({
      receiptNo,
      memberId,
      amount: withdrawAmount,
      date: date || Date.now(),
      note: note || "",
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal recorded successfully!",
      withdrawal: newWithdrawal,
    });

  } catch (error) {
    console.error("Error creating withdrawal:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};

// ৩. উইথড্রয়াল ডিলিট করা (শুধুমাত্র সুপার অ্যাডমিনের জন্য)
exports.deleteWithdrawal = async (req, res) => {
  try {
    const withdrawalId = req.params.id;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ 
        success: false, 
        message: "Withdrawal record not found." 
      });
    }

    // উইথড্র ডিলিট হলে মেম্বারের ব্যালেন্স রিভার্স বা ফিরিয়ে দেওয়া
    const member = await Member.findById(withdrawal.memberId);
    if (member) {
      member.currentBalance = (member.currentBalance || 0) + withdrawal.amount;
      member.totalWithdrawal = Math.max(0, (member.totalWithdrawal || 0) - withdrawal.amount);
      await member.save();
    }

    await Withdrawal.findByIdAndDelete(withdrawalId);

    res.status(200).json({
      success: true,
      message: "Withdrawal deleted successfully!",
    });

  } catch (error) {
    console.error("Error deleting withdrawal:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};