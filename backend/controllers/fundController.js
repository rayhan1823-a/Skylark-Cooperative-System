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
            transactionDate // ফ্রন্টএন্ডে অন্য নামে ডেট পাঠানো হলে যেন মিস না হয়
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

        // ইউজার যে তারিখ দিয়েছে তা নিশ্চিত করা (ফাঁկ বা ইনভ্যালিড হলে আজকের ডেট নেবে)
        let finalDate = Date.now();
        const rawDate = date || transactionDate;
        if (rawDate) {
            const parsedDate = new Date(rawDate);
            if (!isNaN(parsedDate.getTime())) {
                finalDate = parsedDate;
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
            date: finalDate // সঠিক ডেট এখানে সেভ হবে
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
// Get All Fund Transactions
// ======================================
const getFundTransactions = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.category) {
            filter.category = req.query.category;
        }

        const total = await FundTransaction.countDocuments(filter);

        // মেম্বার মডেলের নাম ও আইডি পপুলেট করা হলো
        const transactions = await FundTransaction.find(filter)
            .populate("member", "name memberId phone")
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            page,
            totalPages: Math.ceil(total / limit),
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
        
        // আপডেট করার সময় সঠিক ডেট হ্যান্ডেল করা
        const rawUpdateDate = date || transactionDate;
        if (rawUpdateDate) {
            const parsedUpdateDate = new Date(rawUpdateDate);
            if (!isNaN(parsedUpdateDate.getTime())) {
                transaction.date = parsedUpdateDate;
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