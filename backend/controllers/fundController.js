const FundTransaction = require("../models/FundTransaction");
const Member = require("../models/Member");

// ======================================
// Add Fund Transaction
// ======================================
const addFundTransaction = async (req, res) => {
    try {
        const {
            type,
            category,
            amount,
            description,
            paymentMethod,
            createdBy,
            memberId,
            date,
            transactionDate
        } = req.body;

        // Validation
        if (!type || !category || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Type, Category and Amount are required"
            });
        }

        if (!["INCOME", "EXPENSE"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Transaction Type"
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            });
        }

        let resolvedMember = null;
        let resolvedMemberName = "";
        let resolvedMemberCustomId = "";

        // মেম্বার আইডি দেওয়া থাকলে মেম্বারের তথ্য ডাটাবেজ থেকে নিয়ে আসা
        if (memberId) {
            const memberDoc = await Member.findById(memberId);
            if (memberDoc) {
                resolvedMember = memberDoc._id;
                resolvedMemberName = memberDoc.name || "";
                resolvedMemberCustomId = memberDoc.memberId || "";
            }
        }

        // সঠিক ডেট হ্যান্ডেলিং (টাইমজোন বাগ সমাধান করা হয়েছে)
        let finalDate = new Date();
        const rawDate = date || transactionDate;
        if (rawDate) {
            const parsedDate = new Date(rawDate);
            if (!isNaN(parsedDate.getTime())) {
                // লোকাল ডেটকে সঠিকভাবে UTC-তে কনভার்ட் করে সেভ করার জন্য
                finalDate = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0));
            }
        }

        const transaction = await FundTransaction.create({
            type,
            category: category.trim(),
            amount: Number(amount),
            description: description || "",
            paymentMethod: paymentMethod || "Cash",
            createdBy: createdBy || "Admin",
            member: resolvedMember,
            memberId: resolvedMemberCustomId,
            memberName: resolvedMemberName,
            date: finalDate
        });

        return res.status(201).json({
            success: true,
            message: "Fund Transaction Added Successfully",
            transaction
        });
    }
    catch (error) {
        console.log("Fund Add Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Get All Fund Transactions (Updated for Unlimited)
// ======================================
const getFundTransactions = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        // এখানে পরিবর্তন করা হয়েছে: যদি query-তে limit না থাকে তবে 0 (অর্থাৎ unlimited/সব ডাটা) আসবে
        const limit = req.query.limit !== undefined ? Number(req.query.limit) : 0; 
        const skip = limit > 0 ? (page - 1) * limit : 0;

        const filter = {};
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const total = await FundTransaction.countDocuments(filter);

        let query = FundTransaction.find(filter)
            .populate("member", "name memberId phone")
            .sort({ date: -1, createdAt: -1 });

        // যদি limit জিরো বা তার বেশি থাকে, তবেই পেজিনেশন বা লিমি트 অ্যাপ্লাই হবে
        if (limit > 0) {
            query = query.skip(skip).limit(limit);
        }

        const transactions = await query;

        return res.status(200).json({
            success: true,
            page,
            totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
            totalRecords: total,
            count: transactions.length,
            transactions
        });
    }
    catch (error) {
        console.log("Fund List Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Get Single Fund Transaction
// ======================================
const getFundTransactionById = async (req, res) => {
    try {
        const transaction = await FundTransaction.findById(req.params.id).populate("member", "name memberId phone");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            transaction
        });
    }
    catch (error) {
        console.log("Fund Details Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Search Fund Transactions
// ======================================
const searchFundTransactions = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const filter = {
            $or: [
                { category: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { paymentMethod: { $regex: keyword, $options: "i" } },
                { createdBy: { $regex: keyword, $options: "i" } },
                { memberName: { $regex: keyword, $options: "i" } }
            ]
        };

        const transactions = await FundTransaction.find(filter)
            .populate("member", "name memberId phone")
            .sort({ date: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    }
    catch (error) {
        console.log("Fund Search Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Update Fund Transaction
// ======================================
const updateFundTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await FundTransaction.findById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction Not Found"
            });
        }

        const {
            type,
            category,
            amount,
            description,
            paymentMethod,
            createdBy,
            memberId,
            date,
            transactionDate
        } = req.body;

        if (!type || !category || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Type, Category and Amount are required"
            });
        }

        let resolvedMember = transaction.member;
        let resolvedMemberName = transaction.memberName;
        let resolvedMemberCustomId = transaction.memberId;

        if (memberId !== undefined) {
            if (memberId) {
                const memberDoc = await Member.findById(memberId);
                if (memberDoc) {
                    resolvedMember = memberDoc._id;
                    resolvedMemberName = memberDoc.name || "";
                    resolvedMemberCustomId = memberDoc.memberId || "";
                }
            } else {
                resolvedMember = null;
                resolvedMemberName = "";
                resolvedMemberCustomId = "";
            }
        }

        transaction.type = type;
        transaction.category = category.trim();
        transaction.amount = Number(amount);
        transaction.description = description || "";
        transaction.paymentMethod = paymentMethod || "Cash";
        transaction.createdBy = createdBy || transaction.createdBy;
        transaction.member = resolvedMember;
        transaction.memberName = resolvedMemberName;
        transaction.memberId = resolvedMemberCustomId;
        
        // আপডেট করার সময় সঠিক ডেট হ্যান্ডেল করা (টাইমজোন বাগ সমাধান)
        const rawUpdateDate = date || transactionDate;
        if (rawUpdateDate) {
            const parsedUpdateDate = new Date(rawUpdateDate);
            if (!isNaN(parsedUpdateDate.getTime())) {
                transaction.date = new Date(Date.UTC(parsedUpdateDate.getFullYear(), parsedUpdateDate.getMonth(), parsedUpdateDate.getDate(), 0, 0, 0));
            }
        }

        await transaction.save();

        return res.status(200).json({
            success: true,
            message: "Fund Transaction Updated Successfully",
            transaction
        });
    }
    catch (error) {
        console.log("Fund Update Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Delete Fund Transaction
// ======================================
const deleteFundTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await FundTransaction.findById(id);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction Not Found"
            });
        }

        await FundTransaction.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Fund Transaction Deleted Successfully"
        });
    }
    catch (error) {
        console.log("Fund Delete Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Fund Summary
// ======================================
const getFundSummary = async (req, res) => {
    try {
        const income = await FundTransaction.aggregate([
            { $match: { type: "INCOME" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const expense = await FundTransaction.aggregate([
            { $match: { type: "EXPENSE" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalIncome = income[0]?.total || 0;
        const totalExpense = expense[0]?.total || 0;
        const balance = totalIncome - totalExpense;
        const totalTransactions = await FundTransaction.countDocuments();

        return res.status(200).json({
            success: true,
            summary: {
                totalIncome,
                totalExpense,
                balance,
                totalTransactions
            }
        });
    }
    catch (error) {
        console.log("Fund Summary Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Filter Fund Transactions By Date
// ======================================
const filterFundTransactionsByDate = async (req, res) => {
    try {
        const { from, to } = req.query;
        const filter = {};

        if (from && to) {
            filter.date = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }

        const transactions = await FundTransaction.find(filter)
            .populate("member", "name memberId phone")
            .sort({ date: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    }
    catch (error) {
        console.log("Fund Filter Error :", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// ======================================
// Export Controllers
// ======================================
module.exports = {
    addFundTransaction,
    getFundTransactions,
    getFundTransactionById,
    searchFundTransactions,
    updateFundTransaction,
    deleteFundTransaction,
    getFundSummary,
    filterFundTransactionsByDate
};