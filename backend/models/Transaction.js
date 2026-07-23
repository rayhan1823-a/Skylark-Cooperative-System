const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(

{

    // ===============================
    // Transaction Type
    // ===============================

    type: {

        type: String,

        enum: [
            "INCOME",
            "EXPENSE",
            "REFUND"
        ],

        required: true

    },

    // ===============================
    // Category
    // ===============================

    category: {

        type: String,

        required: true,

        trim: true

    },

    // ===============================
    // Member
    // ===============================

    memberId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Member",

        default: null

    },

    // ===============================
    // Reference Deposit / Loan / Payment
    // ===============================

    referenceId: {

        type: mongoose.Schema.Types.ObjectId,

        default: null

    },

    // ===============================
    // Receipt Number
    // ===============================

    receiptNo: {

        type: String,

        default: ""

    },

    // ===============================
    // Amount
    // ===============================

    amount: {

        type: Number,

        required: true,

        min: 0

    },

    // ===============================
    // Payment Method
    // ===============================

    paymentMethod: {

        type: String,

        enum: [
            "Cash",
            "Bank",
            "Mobile Banking"
        ],

        default: "Cash"

    },

    // ===============================
    // Description
    // ===============================

    description: {

        type: String,

        default: ""

    },

    // ===============================
    // Transaction Date
    // ===============================

    date: {

        type: Date,

        default: Date.now

    },

    // ===============================
    // Created By
    // ===============================

    createdBy: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null

    }

},

{

    timestamps: true,

    versionKey: false

}

);

module.exports = mongoose.model(
    "Transaction",
    transactionSchema
);