// ======================================
// Skylark Cooperative Management System
// Enterprise Payment Allocation Service
// ======================================

// ======================================
// Imports
// ======================================

const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");

// ======================================
// Configuration
// ======================================

const START_YEAR = 2023;
const START_MONTH = 7;

// ======================================
// Monthly Rules
// ======================================

const MONTHLY_RULES = [
  {
    from: { year: 2023, month: 7 },
    to: { year: 2024, month: 6 },
    amount: 500
  },
  {
    from: { year: 2024, month: 7 },
    to: { year: 2025, month: 6 },
    amount: 1000
  },
  {
    from: { year: 2025, month: 7 },
    to: { year: 2026, month: 6 },
    amount: 1500
  },
  {
    from: { year: 2026, month: 7 },
    to: null,
    amount: 2000
  }
];

// ======================================
// Month Names
// ======================================

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// ======================================
// Helpers
// ======================================

const getMonthName = (month) => {
  return MONTH_NAMES[month - 1];
};

const compareYM = (y1, m1, y2, m2) => {
  if (y1 < y2) return -1;
  if (y1 > y2) return 1;
  if (m1 < m2) return -1;
  if (m1 > m2) return 1;
  return 0;
};

const normalizeMonth = (month) => {
  if (typeof month === "number") {
    return month;
  }
  const index = MONTH_NAMES.findIndex(
    m => m.toLowerCase() === String(month).toLowerCase()
  );
  return index + 1;
};

// ======================================
// Get Monthly Amount
// ======================================

const getMonthlyAmount = (year, month) => {
  for (const rule of MONTHLY_RULES) {
    const afterStart = compareYM(year, month, rule.from.year, rule.from.month) >= 0;
    let beforeEnd = true;
    if (rule.to) {
      beforeEnd = compareYM(year, month, rule.to.year, rule.to.month) <= 0;
    }
    if (afterStart && beforeEnd) {
      return rule.amount;
    }
  }
  return 500;
};

// ======================================
// Get Current Year Month
// ======================================

const getCurrentYearMonth = () => {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
};

// ======================================
// Calculate Monthly Paid (From Allocation)
// ======================================

const calculateMonthlyPaid = (deposits, year, month) => {
  let paid = 0;
  for (const deposit of deposits) {
    if (deposit.allocationDetails && deposit.allocationDetails.length > 0) {
      const allocation = deposit.allocationDetails.find(
        item => Number(item.year) === Number(year) && Number(item.month) === Number(month)
      );
      if (allocation) {
        paid += Number(allocation.allocatedAmount || 0);
      }
    } else {
      const depositYear = Number(deposit.year);
      const depositMonth = normalizeMonth(deposit.month);
      if (depositYear === Number(year) && depositMonth === Number(month)) {
        paid += Number(deposit.amount || 0);
      }
    }
  }
  return paid;
};

// ======================================
// Generate Member Allocation (For UI Read)
// ======================================

const generateMemberAllocation = async (memberId) => {
  try {
    const deposits = await Deposit.find({ memberId }).sort({ createdAt: 1 });

    const withdrawals = await Withdrawal.find({ 
      $or: [{ memberId: memberId }, { member: memberId }] 
    }).catch(() => []);
    
    const totalWithdrawal = withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

    let totalPaid = 0;
    let totalTarget = 0; // মোট কত কিস্তি বা টার্গেট হওয়ার কথা
    const monthlyDetails = [];
    const current = getCurrentYearMonth();

    let year = START_YEAR;
    let month = START_MONTH;

    while (year < current.year || (year === current.year && month <= current.month)) {
      const monthlyAmount = getMonthlyAmount(year, month);
      const paidAmount = calculateMonthlyPaid(deposits, year, month);
      
      let dueAmount = monthlyAmount - paidAmount;
      if (dueAmount < 0) dueAmount = 0;

      let status = "Due";
      if (paidAmount >= monthlyAmount) {
        status = "Paid";
      } else if (paidAmount > 0) {
        status = "Partial";
      }

      monthlyDetails.push({
        year,
        month,
        monthName: getMonthName(month),
        monthlyAmount,
        paidAmount,
        dueAmount,
        status,
      });

      totalPaid += paidAmount;
      totalTarget += monthlyAmount; // সব মাসের মোট টার্গেট জমা

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    // ✅ নিখুঁত ও চূড়ান্ত হিসাব:
    const totalDeposit = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    
    // ১. টোটাল ডিপোজিট ডিউ: টার্গেটের বেশি জমা দিলে ০ দেখাবে
    let totalDepositDue = totalTarget - totalDeposit;
    if (totalDepositDue < 0) totalDepositDue = 0;

    // ২. টোটাল ডিউ: টার্গেট থেকে বর্তমান কার্যকরী ব্যালেন্স (জমা - উত্তোলন) বাদ দিয়ে সঠিক নিট বকেয়া
    const currentBalance = totalDeposit - totalWithdrawal;
    let finalTotalDue = totalTarget - currentBalance;
    if (finalTotalDue < 0) finalTotalDue = 0;

    return {
      totalPaid,
      totalDue: finalTotalDue,          // ✅ সঠিক নিট বকেয়া (৫,০০০ টাকা)
      totalDepositDue: totalDepositDue, // ✅ সঠিক ডিপোজিট ডিউ (০ টাকা)
      totalWithdrawal,
      monthlyDetails,
    };
  } catch (error) {
    console.log("Payment Allocation Error:", error.message);
    return { totalPaid: 0, totalDue: 0, totalDepositDue: 0, monthlyDetails: [] };
  }
};

// ======================================
// Rebuild Allocation
// Chronological Auto Splitting Mechanism
// ======================================

const rebuildAllocation = async (memberId) => {
  try {
    const deposits = await Deposit.find({ memberId }).sort({ createdAt: 1 });

    if (deposits.length === 0) {
      return { totalPaid: 0, totalDue: 0, totalDepositDue: 0, monthlyDetails: [] };
    }

    const trackingMap = {};

    let currentTrackYear = START_YEAR;
    let currentTrackMonth = START_MONTH;
    const current = getCurrentYearMonth();

    const targetEndYear = current.year + 1; 
    
    while (currentTrackYear < targetEndYear || (currentTrackYear === targetEndYear && currentTrackMonth <= 12)) {
      const key = `${currentTrackYear}-${currentTrackMonth}`;
      trackingMap[key] = getMonthlyAmount(currentTrackYear, currentTrackMonth);
      
      currentTrackMonth++;
      if (currentTrackMonth > 12) {
        currentTrackMonth = 1;
        currentTrackYear++;
      }
    }

    for (let deposit of deposits) {
      let remainingAmount = Number(deposit.amount);
      const allocationDetails = [];

      let allocYear = START_YEAR;
      let allocMonth = START_MONTH;

      while (remainingAmount > 0) {
        const key = `${allocYear}-${allocMonth}`;
        
        if (trackingMap[key] > 0) {
          const needed = trackingMap[key];
          
          if (remainingAmount >= needed) {
            allocationDetails.push({
              year: allocYear,
              month: allocMonth,
              monthName: getMonthName(allocMonth),
              monthlyAmount: getMonthlyAmount(allocYear, allocMonth),
              allocatedAmount: needed,
              status: "Paid"
            });
            remainingAmount -= needed;
            trackingMap[key] = 0;
          } else {
            allocationDetails.push({
              year: allocYear,
              month: allocMonth,
              monthName: getMonthName(allocMonth),
              monthlyAmount: getMonthlyAmount(allocYear, allocMonth),
              allocatedAmount: remainingAmount,
              status: "Partial"
            });
            trackingMap[key] -= remainingAmount;
            remainingAmount = 0;
          }
        }

        allocMonth++;
        if (allocMonth > 12) {
          allocMonth = 1;
          allocYear++;
        }

        if (allocYear > targetEndYear + 1) {
          break;
        }
      }

      deposit.allocationDetails = allocationDetails;
      deposit.lastAllocationAt = new Date();
      await deposit.save();
    }

    return await generateMemberAllocation(memberId);

  } catch (error) {
    console.log("Rebuild Allocation Error:", error.message);
    return { totalPaid: 0, totalDue: 0, totalDepositDue: 0, monthlyDetails: [] };
  }
};

// ======================================
// Exports
// ======================================

module.exports = {
  getMonthlyAmount,
  getMonthName,
  generateMemberAllocation,
  rebuildAllocation,
};