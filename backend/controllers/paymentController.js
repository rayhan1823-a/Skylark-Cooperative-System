// ======================================
// Skylark Cooperative Management System
// Payment Controller
// Enterprise Version
// ======================================

// ======================================
// Imports
// ======================================

const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

const {
    rebuildAllocation,
} = require("../services/paymentAllocator");

// ======================================
// Generate Receipt Number
// ======================================

const generateReceiptNo = async () => {
  const lastPayment = await Payment.findOne({
    receiptNo: {
      $regex: /^SKY-PAY-/
    }
  }).sort({
    createdAt: -1
  });

  if (!lastPayment) {
    return "SKY-PAY-000001";
  }

  const lastNumber = parseInt(
    lastPayment.receiptNo.replace(
      "SKY-PAY-",
      ""
    ),
    10
  );

  const nextNumber = isNaN(lastNumber)
    ? 1
    : lastNumber + 1;

  return `SKY-PAY-${String(nextNumber).padStart(6, "0")}`;
};

// ======================================
// Create Payment
// ======================================

const createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      memberId, 
      member,   
      amount,
      paymentMethod,
      note,
    } = req.body;

    const targetMemberId = memberId || member;

    if (
      !targetMemberId ||
      !amount
    ) {
      await session.abortTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: "Member and Amount are required",
      });
    }

    const memberDoc = await Member.findById(targetMemberId).session(session);

    if (!memberDoc) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const receiptNo = await generateReceiptNo();

    // ======================================
    // Create Payment
    // ======================================

    const payment = await Payment.create(
      [
        {
          member: memberDoc._id, 
          amount: Number(amount),
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

    // ======================================
    // Create Transaction
    // ======================================

    await Transaction.create(
      [
        {
          type: "INCOME",
          category: "Payment",
          memberId: memberDoc._id,
          amount: Number(amount),
          paymentMethod: paymentMethod || "Cash",
          description: "Member Payment",
          referenceId: payment[0]._id,
          receiptNo,
          createdBy: req.user ? req.user.id : null,
        },
      ],
      {
        session,
      }
    );

    // ======================================
    // Rebuild Allocation
    // ======================================

    const allocationResult = await rebuildAllocation(memberDoc._id);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Payment Added Successfully",
      payment: payment[0],
      allocation: allocationResult
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log("Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Get All Payments
// ======================================

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate(
        "member",
        "memberId name phone fatherName address"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.log("Get Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Get Member Payments
// ======================================

const getMemberPayments = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Member ID",
      });
    }

    const payments = await Payment.find({
      member: memberId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.log("Member Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Get Single Payment
// ======================================

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate(
        "member",
        "memberId name phone fatherName address nid photo"
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.log("Get Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Update Payment
// ======================================

const updatePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(req.params.id).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const {
      amount,
      paymentMethod,
      note,
    } = req.body;

    if (amount !== undefined) {
      payment.amount = Number(amount);
    }

    if (paymentMethod) {
      payment.paymentMethod = paymentMethod;
    }

    if (note !== undefined) {
      payment.note = note;
    }

    await payment.save({ session });

    // ======================================
    // Update Transaction
    // ======================================

    await Transaction.findOneAndUpdate(
      {
        referenceId: payment._id,
        type: "INCOME",
      },
      {
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        description: "Member Payment",
      },
      {
        session,
      }
    );

    const allocationResult = await rebuildAllocation(payment.member);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payment Updated Successfully",
      payment,
      allocation: allocationResult
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log("Update Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================
// Delete Payment
// ======================================

const deletePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(req.params.id).session(session);

    if (!payment) {
      await session.abortTransaction();
      session.endSession();

      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // ======================================
    // Delete Transaction
    // ======================================

    await Transaction.findOneAndDelete(
      {
        referenceId: payment._id,
        type: "INCOME",
      },
      {
        session,
      }
    );

    // ======================================
    // Delete Payment
    // ======================================

    const memberIdForAllocation = payment.member;
    await payment.deleteOne({ session });

    // ======================================
    // Rebuild Allocation
    // ======================================

    const allocationResult = await rebuildAllocation(memberIdForAllocation);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Payment Deleted Successfully",
      allocation: allocationResult
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log("Delete Payment Error:", error);

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
  createPayment,
  getPayments,
  getMemberPayments,
  getPayment,
  updatePayment,
  deletePayment,
};