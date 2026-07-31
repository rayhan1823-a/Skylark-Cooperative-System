const mongoose = require("mongoose");

const fundTransactionSchema = new mongoose.Schema(

{

    // ======================================
    // Transaction Type
    // ======================================

    type:{

        type:String,

        enum:[
            "INCOME",
            "EXPENSE"
        ],

        required:true

    },



    // ======================================
    // Category
    // ======================================

    category:{

        type:String,

        required:true,

        trim:true

    },



    // ======================================
    // Amount
    // ======================================

    amount:{

        type:Number,

        required:true,

        min:0

    },



    // ======================================
    // Description
    // ======================================

    description:{

        type:String,

        default:"",

        trim:true

    },



    // ======================================
    // Payment Method
    // ======================================

    paymentMethod:{

        type:String,

        default:"Cash",

        trim:true

    },



    // ======================================
    // Transaction Date (Added to fix date issue)
    // ======================================

    date:{

        type:Date,

        default:Date.now

    },



    // ======================================
    // Created By
    // ======================================

    createdBy:{

        type:String,

        default:"Admin",

        trim:true

    },



    // ======================================
    // Payment Reference
    // ======================================

    paymentId:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Payment",

        default:null,

        index:true

    },



    receiptNo:{

        type:String,

        default:"",

        index:true

    },



    // ======================================
    // Member Information
    // ======================================

    member:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Member",

        default:null,

        index:true

    },



    memberId:{

        type:String,

        default:"",

        trim:true

    },



    memberName:{

        type:String,

        default:"",

        trim:true

    }

},

{

    timestamps:true,

    versionKey:false,

    collection:"fundtransactions"

}

);

// ======================================
// Indexes
// ======================================

fundTransactionSchema.index({

    createdAt:-1

});

fundTransactionSchema.index({

    date:-1

});

fundTransactionSchema.index({

    type:1,

    category:1

});

// ======================================

module.exports = mongoose.model(

    "FundTransaction",

    fundTransactionSchema

);