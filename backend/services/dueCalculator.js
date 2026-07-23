const mongoose = require("mongoose");
const Deposit = require("../models/Deposit");
const Member = require("../models/Member");

// ======================================
// Monthly Amount Rule
// ======================================
const getMonthlyAmount = (year, month) => {
    // July 2023 - June 2024 -> 500
    if (year === 2023 && month >= 7) return 500;
    if (year === 2024 && month <= 6) return 500;

    // July 2024 - June 2025 -> 1000
    if (year === 2024 && month >= 7) return 1000;
    if (year === 2025 && month <= 6) return 1000;

    // July 2025 - June 2026 -> 1500
    if (year === 2025 && month >= 7) return 1500;
    if (year === 2026 && month <= 6) return 1500;

    // July 2026 onwards -> 2000
    if (year === 2026 && month >= 7) return 2000;
    if (year > 2026) return 2000;

    return 500;
};

// ======================================
// Calculate Member Summary
// ======================================
const calculateMemberSummary = async (memberId) => {
    try {
        let memberObjectId = memberId;

        // ===============================
        // Check Custom Member ID
        // ===============================
        if (!mongoose.Types.ObjectId.isValid(memberId)) {
            const member = await Member.findOne({ memberId: memberId });
            if (!member) {
                throw new Error("Member not found");
            }
            memberObjectId = member._id;
        }

        // ===============================
        // Get Deposit History
        // ===============================
        const deposits = await Deposit.find({ memberId: memberObjectId });

        let totalDeposit = 0;
        deposits.forEach(item => {
            totalDeposit += Number(item.amount || 0);
        });

        let monthlyDetails = [];
        let totalDue = 0;
        
        // মেম্বারের মোট জমা রাখা টাকা একটি ভেরিয়েবলে নিলাম যা থেকে প্রতি মাসের খরচ কাটবো
        let remainingDepositPool = totalDeposit; 

        // ===============================
        // Start July 2023
        // ===============================
        let year = 2023;
        let month = 7;

        const today = new Date();
        const endYear = today.getFullYear();
        const endMonth = today.getMonth() + 1;

        while (year < endYear || (year === endYear && month <= endMonth)) {
            const monthlyAmount = getMonthlyAmount(year, month);

            const monthName = new Date(year, month - 1).toLocaleString("en-US", {
                month: "long",
            });

            // ========================================================
            // নতুন লজিক: টোটাল জমার পুল (Pool) থেকে টাকা কেটে মাসের হিসাব করা
            // ========================================================
            let paidAmountForThisMonth = 0;

            if (remainingDepositPool >= monthlyAmount) {
                // যদি পুলে পর্যাপ্ত টাকা থাকে, তবে এই মাসের পুরো টাকা পরিশোধ
                paidAmountForThisMonth = monthlyAmount;
                remainingDepositPool -= monthlyAmount;
            } else if (remainingDepositPool > 0) {
                // যদি পুলে কিছু টাকা থাকে কিন্তু তা মাসের ফিক্সড অ্যামাউন্টের চেয়ে কম হয়
                paidAmountForThisMonth = remainingDepositPool;
                remainingDepositPool = 0;
            } else {
                // পুলে কোনো টাকাই অবশিষ্ট না থাকলে পেইড ০
                paidAmountForThisMonth = 0;
            }

            // বকেয়া হিসাব
            const dueAmount = Math.max(monthlyAmount - paidAmountForThisMonth, 0);
            totalDue += dueAmount;

            monthlyDetails.push({
                year,
                month: monthName,
                monthlyAmount,
                paidAmount: paidAmountForThisMonth,
                dueAmount,
                penalty: 0,
                penaltyWaived: 0
            });

            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
        }

        return {
            totalDeposit,
            totalDue,
            totalPenalty: 0,
            advanceBalance: remainingDepositPool, // যদি সব মাস কাটার পরও পুলে টাকা বাঁচে, তা অ্যাডভান্স
            monthlyDetails
        };

    } catch (error) {
        console.log("Due Calculator Error:", error.message);
        return {
            totalDeposit: 0,
            totalDue: 0,
            totalPenalty: 0,
            advanceBalance: 0,
            monthlyDetails: []
        };
    }
};

module.exports = {
    calculateMemberSummary,
    getMonthlyAmount
};