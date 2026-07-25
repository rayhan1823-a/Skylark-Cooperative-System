// ======================================
// Imports
// ======================================
const mongoose = require("mongoose");

const Deposit = require("../models/Deposit");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

const {
    rebuildAllocation,
} = require("../services/paymentAllocator");

// ======================================
// Generate Receipt Number
// SKY-DEP-000001
// ======================================
const generateReceiptNo = async () => {
    const lastDeposit = await Deposit.findOne({
        receiptNo: {
            $regex: /^SKY-DEP-/
        }
    }).sort({
        createdAt: -1
    });

    if (!lastDeposit || !lastDeposit.receiptNo) {
        return "SKY-DEP-000001";
    }

    const lastNumber = parseInt(
        lastDeposit.receiptNo.replace(
            "SKY-DEP-",
            ""
        ),
        10
    );

    const nextNumber =
        isNaN(lastNumber)
            ? 1
            : lastNumber + 1;

    return `SKY-DEP-${String(nextNumber).padStart(6, "0")}`;
};

// ======================================
// Create Deposit
// ======================================
const createDeposit = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            memberId,
            amount,
            month,
            year,
            depositDate, 
            paymentMethod,
            note,
        } = req.body;

        // ==========================
        // Validation
        // ==========================
        if (
            !memberId ||
            !amount ||
            !month ||
            !year
        ) {
            await session.abortTransaction();
            session.endSession();

            return res.status(400).json({
                success: false,
                message: "Member, Amount, Month and Year are required",
            });
        }

        // ==========================
        // Find Member (Supports both ObjectId and custom memberId string)
        // ==========================
        let member;
        if (mongoose.Types.ObjectId.isValid(memberId)) {
            member = await Member.findById(memberId).session(session);
        }
        
        if (!member) {
            member = await Member.findOne({ 
                $or: [
                    { memberId: memberId }, 
                    { memberId: new RegExp('^' + memberId + '$', 'i') }
                ] 
            }).session(session);
        }

        if (!member) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Member not found",
            });
        }

        // ==========================
        // Receipt No
        // ==========================
        const receiptNo = await generateReceiptNo();

        // ==========================
        // Create Deposit
        // ==========================
        const deposit = await Deposit.create(
            [
                {
                    memberId: member._id,
                    amount: Number(amount),
                    month,
                    year: Number(year),
                    depositDate: depositDate ? new Date(depositDate) : new Date(), 
                    receiptNo,
                    allocationGroup: receiptNo,
                    paymentMethod: paymentMethod || "Cash",
                    note: note || "",
                    createdBy: req.user ? req.user.id : null,
                },
            ],
            {
                session,
            }
        );

        // ==========================
        // Create Transaction
        // ==========================
        await Transaction.create(
            [
                {
                    type: "INCOME",
                    category: "Deposit",
                    memberId: member._id,
                    amount: Number(amount),
                    paymentMethod: paymentMethod || "Cash",
                    description: `Monthly Deposit (${month}-${year})`,
                    referenceId: deposit[0]._id,
                    receiptNo,
                    date: depositDate ? new Date(depositDate) : new Date(), 
                    createdBy: req.user ? req.user.id : null,
                },
            ],
            {
                session,
            }
        );

        // ==========================
        // Rebuild Allocation
        // ==========================
        const allocationResult = await rebuildAllocation(member._id);

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Deposit Added Successfully",
            deposit: deposit[0],
            allocation: allocationResult
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.log("Create Deposit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
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
                "memberId name phone fatherName address"
            )
            .populate(
                "createdBy",
                "name role"
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: deposits.length,
            deposits,
        });
    } catch (error) {
        console.log("Get Deposits Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// ======================================
// Get Member Deposits (Updated with robust ID handling)
// ======================================
const getMemberDeposits = async (req, res) => {
    try {
        const { id } = req.params;
        let queryId = id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            const memberDoc = await Member.findOne({ 
                $or: [
                    { memberId: id }, 
                    { memberId: new RegExp('^' + id + '$', 'i') }
                ] 
            });
            if (memberDoc) {
                queryId = memberDoc._id;
            }
        }

        const deposits = await Deposit.find({
            $or: [
                { memberId: queryId },
                { member: queryId }
            ]
        }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: deposits.length,
            deposits,
        });
    } catch (error) {
        console.log("Member Deposit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
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
                "memberId name phone fatherName address nid photo"
            )
            .populate(
                "createdBy",
                "name role"
            );

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: "Deposit not found",
            });
        }

        return res.status(200).json({
            success: true,
            deposit,
        });
    } catch (error) {
        console.log("Get Deposit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// ======================================
// Update Deposit
// ======================================
const updateDeposit = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const deposit = await Deposit.findById(req.params.id).session(session);

        if (!deposit) {
            await session.abortTransaction();
            session.endSession();

            return res.status(404).json({
                success: false,
                message: "Deposit not found",
            });
        }

        const {
            amount,
            month,
            year,
            depositDate, 
            paymentMethod,
            note,
        } = req.body;

        if (amount !== undefined) deposit.amount = Number(amount);
        if (month) deposit.month = month;
        if (year) deposit.year = Number(year);
        if (depositDate) deposit.depositDate = new Date(depositDate); 
        if (paymentMethod) deposit.paymentMethod = paymentMethod;
        if (note !== undefined) deposit.note = note;

        await deposit.save({ session });

        const updateData = {
            amount: deposit.amount,
            paymentMethod: deposit.paymentMethod,
            description: `Monthly Deposit (${deposit.month}-${deposit.year})`,
        };
        if (depositDate) updateData.date = new Date(depositDate);

        await Transaction.findOneAndUpdate(
            {
                referenceId: deposit._id,
                type: "INCOME",
            },
            updateData,
            {
                session,
            }
        );

        // ==========================
        // Rebuild Allocation
        // ==========================
        const allocationResult = await rebuildAllocation(deposit.memberId);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Deposit Updated Successfully",
            deposit,
            allocation: allocationResult
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.log("Update Deposit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// ======================================
// Delete Deposit (Safely handled)
// ======================================
const deleteDeposit = async (req, res) => {
    try {
        const depositId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(depositId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Deposit ID format",
            });
        }

        const deposit = await Deposit.findById(depositId);

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: "Deposit not found",
            });
        }

        const memberId = deposit.memberId;

        // ==========================
        // Delete Transaction
        // ==========================
        await Transaction.findOneAndDelete({
            referenceId: deposit._id,
            type: "INCOME",
        });

        // ==========================
        // Delete Deposit
        // ==========================
        await Deposit.findByIdAndDelete(depositId);

        // ==========================
        // Rebuild Allocation (Safe handling)
        // ==========================
        let allocationResult = null;
        try {
            if (typeof rebuildAllocation === "function") {
                allocationResult = await rebuildAllocation(memberId);
            }
        } catch (allocError) {
            console.log("Allocation Rebuild Warning during delete:", allocError.message);
        }

        return res.status(200).json({
            success: true,
            message: "Deposit Deleted Successfully",
            allocation: allocationResult
        });

    } catch (error) {
        console.log("Delete Deposit Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
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
    deleteDeposit,
};