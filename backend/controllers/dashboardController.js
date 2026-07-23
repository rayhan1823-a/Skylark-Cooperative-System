// ======================================
// Imports
// ======================================
const Member = require("../models/Member");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal"); 
const FundTransaction = require("../models/FundTransaction");
const Loan = require("../models/Loan"); 
const Penalty = require("../models/Penalty"); // ✅ পেনাল্টি মডেল যুক্ত করা হলো

const {
    calculateMemberSummary,
} = require("../services/dueCalculator");

// ======================================
// Dashboard Controller
// ======================================
const getDashboard = async (req, res) => {
  try {
    // ==================================
    // Member Statistics
    // ==================================
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: "Active" });
    const inactiveMembers = await Member.countDocuments({ status: "Inactive" });
    const exitedMembers = await Member.countDocuments({ status: "Exited" });

    // ==================================
    // Deposit Statistics
    // ==================================
    const depositResult = await Deposit.aggregate([
      {
        $group: {
          _id: null,
          totalDeposit: { $sum: "$amount" },
        },
      },
    ]);
    const totalDeposit = depositResult[0]?.totalDeposit || 0;

    // ==================================
    // Withdrawal Statistics 
    // ==================================
    const withdrawalResult = await Withdrawal.aggregate([
      {
        $group: {
          _id: null,
          totalWithdrawal: { $sum: "$amount" },
        },
      },
    ]);
    const totalWithdrawal = withdrawalResult[0]?.totalWithdrawal || 0;

    // ==================================
    // Loan Statistics
    // ==================================
    const loanResult = await Loan.aggregate([
      {
        $group: {
          _id: null,
          totalLoan: { $sum: "$amount" },
        },
      },
    ]);
    const totalLoan = loanResult[0]?.totalLoan || 0;

    // ==================================
    // Penalty Collection Statistics
    // ==================================
    const penaltyResult = await Penalty.aggregate([
      {
        $group: {
          _id: null,
          totalPenalty: { $sum: "$amount" },
        },
      },
    ]);
    const totalPenaltyCollection = penaltyResult[0]?.totalPenalty || 0;

    // ==================================
    // Fund & Real Current Balance Statistics
    // ==================================
    const income = await FundTransaction.aggregate([
      { $match: { type: "INCOME" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const expense = await FundTransaction.aggregate([
      { $match: { type: "EXPENSE" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    let totalIncome = income[0]?.total || 0;
    const totalExpense = expense[0]?.total || 0;

    // আলাদা করে শুধু ব্যাংক প্রফিট বের করার জন্য
    const bankProfitIncome = await FundTransaction.aggregate([
      { 
        $match: { 
          $or: [
            { category: "Bank Profit" },
            { category: { $regex: /bank.*profit/i } }
          ] 
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalBankProfit = bankProfitIncome[0]?.total || 0;

    // যদি মোট ইনকামের মধ্যে ব্যাংক প্রফিট অন্তর্ভুক্ত না থাকে, তবে তা যুক্ত করে নেওয়া হলো
    if (totalIncome < totalBankProfit) {
      totalIncome += totalBankProfit;
    }

    // ✅ মোট ইনকামের সাথে টোটাল পেনাল্টি কালেকশন যুক্ত করা হলো
    totalIncome += totalPenaltyCollection;

    // সঠিক ব্যালেন্স হিসাব: (টোটাল ডিপোজিট + সব ইনকাম ও ব্যাংক প্রফিট + পেনাল্টি কালেকশন) - (খরচ + উইথড্রয়াল)
    const balance = (totalDeposit + totalIncome) - (totalExpense + totalWithdrawal);

    // ==================================
    // Today's & This Month's Collection
    // ==================================
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayCollection = await Deposit.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lt: endOfToday },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const todayDeposit = todayCollection[0]?.total || 0;

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthCollection = await Deposit.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: nextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const thisMonthDeposit = monthCollection[0]?.total || 0;

    // ==================================
    // Due & Fine Core Logic Integration
    // ==================================
    const members = await Member.find({ status: "Active" });
    let totalDue = 0;
    const monthlyDueMap = {};
    const chartDepositMap = {};

    for (const member of members) {
      const summary = await calculateMemberSummary(member._id);
      totalDue += Number(summary.totalDue || 0);

      summary.monthlyDetails.forEach((item) => {
        const key = `${item.year}-${item.month}`;
        
        if (item.dueAmount > 0) {
          if (!monthlyDueMap[key]) {
            monthlyDueMap[key] = {
              year: item.year,
              month: item.month,
              total: 0,
            };
          }
          monthlyDueMap[key].total += Number(item.dueAmount);
        }

        if (item.paidAmount > 0) {
          if (!chartDepositMap[key]) {
            chartDepositMap[key] = {
              year: item.year,
              month: item.month,
              total: 0,
            };
          }
          chartDepositMap[key].total += Number(item.paidAmount);
        }
      });
    }

    const monthlyDue = Object.values(monthlyDueMap);
    
    const monthlyDepositFormatted = Object.values(chartDepositMap).map(item => {
      const dateObj = new Date(`${item.month} 1, ${item.year}`);
      return {
        _id: {
          year: item.year,
          month: dateObj.getMonth() + 1
        },
        total: item.total
      };
    }).sort((a, b) => (a._id.year - b._id.year) || (a._id.month - b._id.month));

    // ==================================
    // Recent Lists & Populates
    // ==================================
    const recentMembers = await Member.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("memberId name phone status joiningDate photo");

    const recentDeposits = await Deposit.find()
      .populate("memberId", "memberId name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTransactions = await FundTransaction.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // ==================================
    // Dashboard Data Object
    // ==================================
    const dashboardData = {
      totalMembers,
      activeMembers,
      inactiveMembers,
      exitedMembers,
      totalIncome,
      totalExpense,
      balance,
      totalDeposit,
      todayDeposit,
      thisMonthDeposit,
      totalDue,
      monthlyDeposit: monthlyDepositFormatted,
      monthlyDue,
      recentMembers,
      recentDeposits,
      recentTransactions,
      totalLoan, 
      totalWithdrawal, 
      totalProfit: totalBankProfit, 
      totalPenaltyCollection, // ড্যাশবোর্ডে পেনাল্টি কালেকশন দেখানোর জন্য
    };

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });

  } catch (error) {
    console.log("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Dashboard Error",
      error: error.message,
    });
  }
};

// ==================================
// Export Controller
// ==================================
module.exports = {
  getDashboard,
};