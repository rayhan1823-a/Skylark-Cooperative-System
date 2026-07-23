const mongoose = require("mongoose");

// ======================================
// Member Schema
// ======================================

const memberSchema = new mongoose.Schema(

{

    // ======================================
    // Basic Information
    // ======================================

    memberId: {

        type: String,

        required: true,

        unique: true,

        trim: true,

        uppercase: true

    },

    name: {

        type: String,

        required: true,

        trim: true,

        maxlength: 100

    },

    fatherName: {

        type: String,

        required: true,

        trim: true,

        maxlength: 100

    },

    motherName: {

        type: String,

        required: true,

        trim: true,

        maxlength: 100

    },

    phone: {

        type: String,

        required: true,

        unique: true,

        trim: true,

        maxlength: 15

    },

    emergencyContact: {

        type: String,

        default: "",

        trim: true

    },

    bloodGroup: {

        type: String,

        enum: [

            "",

            "A+",

            "A-",

            "B+",

            "B-",

            "AB+",

            "AB-",

            "O+",

            "O-"

        ],

        default: ""

    },

    nid: {

        type: String,

        required: true,

        unique: true,

        trim: true

    },

    dateOfBirth: {

        type: Date,

        required: true

    },

    joiningDate: {

        type: Date,

        required: true

    },

    email: {

        type: String,

        default: "",

        trim: true,

        lowercase: true

    },

    profession: {

        type: String,

        default: "",

        trim: true

    },

    gender: {

        type: String,

        enum: [

            "",

            "Male",

            "Female",

            "Other"

        ],

        default: ""

    },
    // ======================================
    // Address Information
    // ======================================

    presentAddress: {

        type: String,

        required: true,

        trim: true

    },

    permanentAddress: {

        type: String,

        required: true,

        trim: true

    },

    district: {

        type: String,

        default: "",

        trim: true

    },

    division: {

        type: String,

        default: "",

        trim: true

    },

    postcode: {

        type: String,

        default: "",

        trim: true

    },

    // ======================================
    // Nominee Information
    // ======================================

    nomineeName: {

        type: String,

        default: "",

        trim: true

    },

    nomineeRelation: {

        type: String,

        default: "",

        trim: true

    },

    nomineePhone: {

        type: String,

        default: "",

        trim: true

    },

    nomineeNid: {

        type: String,

        default: "",

        trim: true

    },

    nomineePhoto: {

        type: String,

        default: ""

    },

    // ======================================
    // Uploaded Files
    // ======================================

    photo: {

        type: String,

        default: ""

    },

    nidFile: {

        type: String,

        default: ""

    },

    signature: {

        type: String,

        default: ""

    },

    // ======================================
    // Member Status
    // ======================================

    status: {

        type: String,

        enum: [

            "Active",

            "Inactive",

            "Exited"

        ],

        default: "Active"

    },
    // ======================================
    // Member Exit Information
    // ======================================

    exitDate: {

        type: Date,

        default: null

    },

    exitReason: {

        type: String,

        default: "",

        trim: true

    },

    refundAmount: {

        type: Number,

        default: 0

    },

    // ======================================
    // Financial Information
    // ======================================

    totalDeposit: {

        type: Number,

        default: 0,

        min: 0

    },

    totalPaid: {

        type: Number,

        default: 0,

        min: 0

    },

    totalDue: {

        type: Number,

        default: 0,

        min: 0

    },

    totalFine: {

        type: Number,

        default: 0,

        min: 0

    },

    advanceAmount: {

        type: Number,

        default: 0,

        min: 0

    },

    totalRefund: {

        type: Number,

        default: 0,

        min: 0

    },

    paymentStatus: {

        type: String,

        enum: [

            "PAID",

            "PARTIAL",

            "DUE"

        ],

        default: "DUE"

    },

    lastPaymentDate: {

        type: Date,

        default: null

    },

    lastPaymentAmount: {

        type: Number,

        default: 0

    },

    dueMonths: {

        type: Number,

        default: 0

    },

    // ======================================
    // Loan Information
    // ======================================

    loanAmount: {

        type: Number,

        default: 0

    },

    loanDue: {

        type: Number,

        default: 0

    },

    loanStatus: {

        type: String,

        enum: [

            "NONE",

            "ACTIVE",

            "PAID"

        ],

        default: "NONE"

    },
    // ======================================
    // Other Information
    // ======================================

    penaltyWaiver: {

        type: Boolean,

        default: false

    },

    remarks: {

        type: String,

        default: "",

        trim: true

    },

    notes: {

        type: String,

        default: "",

        trim: true

    }

},

{

    timestamps: true,

    versionKey: false,

    strict: true,

    collection: "members",

    toJSON: {

        virtuals: true

    },

    toObject: {

        virtuals: true

    }

}

);

// ======================================
// Virtual Fields
// ======================================

memberSchema.virtual("fullAddress").get(function () {

    return `${this.presentAddress}`;

});

// ======================================
// Indexes
// ======================================

// status search
memberSchema.index({
    status: 1
});

// payment status search
memberSchema.index({
    paymentStatus: 1
});
// ======================================
// Export
// ======================================

module.exports = mongoose.model(

    "Member",

    memberSchema

);