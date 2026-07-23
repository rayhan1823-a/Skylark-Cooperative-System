const mongoose = require("mongoose");

const Deposit = require("../models/Deposit");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

// ======================================
// Generate Receipt Number
// SKY-DEP-000001
// ======================================

const generateReceiptNo = async () => {

    const lastDeposit = await Deposit.findOne()
        .sort({ createdAt: -1 });

    if (!lastDeposit || !lastDeposit.receiptNo) {
        return "SKY-DEP-000001";
    }

    const lastNumber = parseInt(
        lastDeposit.receiptNo.replace("SKY-DEP-", "")
    );

    const nextNumber = lastNumber + 1;

    return `SKY-DEP-${String(nextNumber).padStart(6, "0")}`;
};

// ======================================
// Create Deposit
// ======================================

const createDeposit = async (req, res) => {

    try {

        const {
            memberId,
            amount,
            month,
            year,
            paymentMethod,
            note,
            createdBy
        } = req.body;

        // Validation

        if (!memberId || !amount || !month || !year) {

            return res.status(400).json({
                success: false,
                message: "Member ID, Amount, Month and Year are required"
            });

        }

        // ======================================
        // Find Member
        // ======================================

        let member;

        if (mongoose.Types.ObjectId.isValid(memberId)) {

            member = await Member.findOne({
                $or: [
                    { _id: memberId },
                    { memberId: memberId }
                ]
            });

        } else {

            member = await Member.findOne({
                memberId: memberId
            });

        }

        if (!member) {

            return res.status(404).json({
                success: false,
                message: "Member not found"
            });

        }

        // ======================================
        // Generate Receipt
        // ======================================

        const receiptNo = await generateReceiptNo();
        // ======================================
        // Create Deposit
        // ======================================

        const deposit = await Deposit.create({

            memberId: member._id,

            amount: Number(amount),

            month,

            year: Number(year),

            receiptNo,

            paymentMethod: paymentMethod || "Cash",

            note: note || "",

            createdBy: createdBy || "Admin"

        });

        // ======================================
        // Create Transaction
        // ======================================

        await Transaction.create({

            type: "INCOME",

            category: "Member Deposit",

            memberId: member._id,

            amount: Number(amount),

            paymentMethod: paymentMethod || "Cash",

            description: `Deposit received from ${member.name}`,

            createdBy: createdBy || "Admin"

        });

        return res.status(201).json({

            success: true,

            message: "Deposit Added Successfully",

            receiptNo,

            deposit

        });

    }
    catch (error) {

        console.log("Create Deposit Error:", error);

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

// ======================================
// Get All Deposits
// ======================================

const getDeposits = async (req, res) => {

    try {

        const deposits = await Deposit.find()

            .populate(
                "memberId",
                "memberId name phone"
            )

            .sort({
                createdAt: -1
            });

        return res.status(200).json({

            success: true,

            count: deposits.length,

            deposits

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};
// ======================================
// Get Member Deposits
// ======================================

const getMemberDeposits = async (req, res) => {

    try {

        const { memberId } = req.params;

        let member;

        if (mongoose.Types.ObjectId.isValid(memberId)) {

            member = await Member.findById(memberId);

        } else {

            member = await Member.findOne({
                memberId: memberId
            });

        }

        if (!member) {

            return res.status(404).json({
                success: false,
                message: "Member not found"
            });

        }

        const deposits = await Deposit.find({

            memberId: member._id

        })

        .sort({

            createdAt: -1

        });

        return res.status(200).json({

            success: true,

            count: deposits.length,

            deposits

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

// ======================================
// Delete Deposit
// ======================================

const deleteDeposit = async (req, res) => {

    try {

        const deposit = await Deposit.findByIdAndDelete(
            req.params.id
        );

        if (!deposit) {

            return res.status(404).json({

                success: false,

                message: "Deposit not found"

            });

        }

        return res.status(200).json({

            success: true,

            message: "Deposit Deleted Successfully"

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};
// ======================================
// Get Single Deposit
// ======================================

const getDeposit = async (req, res) => {

    try {

        const deposit = await Deposit.findById(req.params.id)

            .populate(
                "memberId",
                "memberId name phone"
            );

        if (!deposit) {

            return res.status(404).json({

                success: false,

                message: "Deposit not found"

            });

        }

        return res.status(200).json({

            success: true,

            deposit

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

// ======================================
// Update Deposit
// ======================================

const updateDeposit = async (req, res) => {

    try {

        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {

            return res.status(404).json({

                success: false,

                message: "Deposit not found"

            });

        }

        const {

            amount,
            month,
            year,
            paymentMethod,
            note

        } = req.body;

        deposit.amount = amount || deposit.amount;
        deposit.month = month || deposit.month;
        deposit.year = year || deposit.year;
        deposit.paymentMethod = paymentMethod || deposit.paymentMethod;
        deposit.note = note || deposit.note;

        await deposit.save();

        return res.status(200).json({

            success: true,

            message: "Deposit Updated Successfully",

            deposit

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: "Server Error",

            error: error.message

        });

    }

};

// ======================================
// Export
// ======================================

module.exports = {

    createDeposit,

    getDeposits,

    getMemberDeposits,

    getDeposit,

    updateDeposit,

    deleteDeposit

};