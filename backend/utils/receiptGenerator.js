// ======================================
// Skylark Cooperative Management System
// Receipt Generator Service
// ======================================

// ======================================
// Imports
// ======================================

const Deposit = require("../models/Deposit");
const Member = require("../models/Member");

// ======================================
// Generate Receipt Data
// ======================================

const generateReceipt = async (

  receiptNo

) => {

  try {

    // ======================================
    // Load Deposits
    // ======================================

    const deposits = await Deposit.find({

      allocationGroup: receiptNo,

    })

    .populate(

      "memberId",

      "memberId name phone fatherName motherName presentAddress"

    )

    .sort({

      year: 1,

      month: 1,

      createdAt: 1,

    });

    // ======================================
    // Backward Compatibility
    // ======================================

    if (deposits.length === 0) {

      const singleDeposit = await Deposit.findOne({

        receiptNo,

      })

      .populate(

        "memberId",

        "memberId name phone fatherName motherName presentAddress"

      );

      if (!singleDeposit) {

        return null;

      }

      deposits.push(singleDeposit);

    }

    const member = deposits[0].memberId;
    // ======================================
    // Receipt Summary
    // ======================================

    let totalAmount = 0;

    const receiptMonths = [];

    let paymentMethod = "Cash";

    let createdAt = deposits[0].createdAt;

    // ======================================
    // Build Receipt Items
    // ======================================

    for (const deposit of deposits) {

      totalAmount += Number(

        deposit.amount || 0

      );

      paymentMethod =

        deposit.paymentMethod || paymentMethod;

      if (

        deposit.allocationDetails &&

        deposit.allocationDetails.length > 0

      ) {

        for (const item of deposit.allocationDetails) {

          receiptMonths.push({

            year: item.year,

            month: item.month,

            monthName: item.monthName,

            amount: item.allocatedAmount,

            status: item.status,

          });

        }

      }

      else {

        receiptMonths.push({

          year: deposit.year,

          month: 0,

          monthName: deposit.month,

          amount: deposit.amount,

          status: "Paid",

        });

      }

    }
    // ======================================
    // Sort Receipt Months
    // ======================================

    receiptMonths.sort((a, b) => {

      if (a.year !== b.year) {

        return a.year - b.year;

      }

      return a.month - b.month;

    });

    // ======================================
    // Receipt Object
    // ======================================

    const receipt = {

      receiptNo,

      member: {

        _id: member._id,

        memberId: member.memberId,

        name: member.name,

        phone: member.phone,

        fatherName: member.fatherName,

        motherName: member.motherName,

        address: member.presentAddress,

      },

      paymentMethod,

      totalAmount,

      totalMonths: receiptMonths.length,

      createdAt,

      months: receiptMonths,

    };

    return receipt;

  } catch (error) {

    console.log(

      "Receipt Generator Error:",

      error.message

    );

    return null;

  }

};
// ======================================
// Get Receipt By Number
// ======================================

const getReceiptByNumber = async (

  receiptNo

) => {

  try {

    if (!receiptNo) {

      return null;

    }

    const receipt = await generateReceipt(

      receiptNo

    );

    return receipt;

  } catch (error) {

    console.log(

      "Get Receipt Error:",

      error.message

    );

    return null;

  }

};

// ======================================
// Get Receipt By Deposit ID
// ======================================

const getReceiptByDepositId = async (

  depositId

) => {

  try {

    const deposit = await Deposit.findById(

      depositId

    );

    if (!deposit) {

      return null;

    }

    return await generateReceipt(

      deposit.allocationGroup ||

      deposit.receiptNo

    );

  } catch (error) {

    console.log(

      "Receipt By Deposit Error:",

      error.message

    );

    return null;

  }

};
// ======================================
// Receipt Print Helper
// ======================================

const printReceiptData = async (

  receiptNo

) => {

  try {

    const receipt = await generateReceipt(

      receiptNo

    );

    if (!receipt) {

      return null;

    }

    return {

      receiptNo: receipt.receiptNo,

      member: receipt.member,

      paymentMethod: receipt.paymentMethod,

      totalAmount: receipt.totalAmount,

      totalMonths: receipt.totalMonths,

      createdAt: receipt.createdAt,

      months: receipt.months,

    };

  } catch (error) {

    console.log(

      "Print Receipt Error:",

      error.message

    );

    return null;

  }

};
// ======================================
// Exports
// ======================================

module.exports = {

  generateReceipt,

  getReceiptByNumber,

  getReceiptByDepositId,

  printReceiptData,

};