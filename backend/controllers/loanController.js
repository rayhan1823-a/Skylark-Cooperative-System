const Loan = require("../models/Loan");
const Member = require("../models/Member");

// ======================================
// Add Loan (Only SUPER_ADMIN)
// ======================================
const createLoan = async (req, res) => {
  try {
    if (req.user && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only SUPER_ADMIN can add loans.",
      });
    }

    const {
      member,
      amount,
      issueDate,
      dueDate,
      remarks,
    } = req.body;

    if (!member || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Member, Amount and Due Date are required.",
      });
    }

    const memberInfo = await Member.findById(member);

    if (!memberInfo) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    // ইউনিক রিসিট নম্বর জেনারেট করা (যেমন: SKY-LOAN-00001)
    const lastLoan = await Loan.findOne().sort({ createdAt: -1 });
    let loanSeq = 1;
    if (lastLoan && lastLoan.receiptNo) {
      const parts = lastLoan.receiptNo.split("-");
      const lastNum = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNum)) {
        loanSeq = lastNum + 1;
      }
    }
    const receiptNo = `SKY-LOAN-${String(loanSeq).padStart(5, "0")}`;

    const loan = await Loan.create({
      member,
      amount,
      issueDate,
      dueDate,
      remarks,
      receiptNo, // রিসিট নম্বর সেভ হলো
    });

    res.status(201).json({
      success: true,
      message: "Loan Added Successfully",
      loan,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Get All Loans
// ======================================
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("member", "memberId name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Get Single Loan
// ======================================
const getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("member", "memberId name phone");

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    res.json({
      success: true,
      loan,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Get Single Loan Receipt
// ======================================
const getLoanReceipt = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("member", "memberId name phone address presentAddress");

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan receipt not found",
      });
    }

    res.json({
      success: true,
      loan,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Update Loan (Only SUPER_ADMIN)
// ======================================
const updateLoan = async (req, res) => {
  try {
    if (req.user && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only SUPER_ADMIN can update loans.",
      });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    loan.amount = req.body.amount || loan.amount;
    loan.issueDate = req.body.issueDate || loan.issueDate;
    loan.dueDate = req.body.dueDate || loan.dueDate;
    loan.status = req.body.status || loan.status;
    loan.remarks = req.body.remarks || loan.remarks;

    await loan.save();

    res.json({
      success: true,
      message: "Loan Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Delete Loan (Only SUPER_ADMIN)
// ======================================
const deleteLoan = async (req, res) => {
  try {
    if (req.user && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only SUPER_ADMIN can delete loans.",
      });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    await Loan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Loan Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Member Loan History
// ======================================
const getMemberLoans = async (req, res) => {
  try {
    const loans = await Loan.find({
      member: req.params.memberId,
    })
      .populate("member", "memberId name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createLoan,
  getLoans,
  getLoan,
  getLoanReceipt,
  updateLoan,
  deleteLoan,
  getMemberLoans,
};