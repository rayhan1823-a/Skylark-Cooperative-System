const mongoose = require("mongoose");


const memberExitSchema = new mongoose.Schema(

{

    // ==========================
    // Member Reference
    // ==========================

    memberId:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Member",

        required:true

    },


    // ==========================
    // Exit Date
    // ==========================

    exitDate:{

        type:Date,

        default:Date.now

    },


    // ==========================
    // Financial Details
    // ==========================

    totalDeposit:{

        type:Number,

        default:0

    },


    profitAmount:{

        type:Number,

        default:0

    },


    penaltyAmount:{

        type:Number,

        default:0

    },


    refundAmount:{

        type:Number,

        required:true

    },


    // ==========================
    // Payment
    // ==========================

    paymentMethod:{

        type:String,

        enum:[
            "Cash",
            "Bank",
            "Mobile Banking"
        ],

        default:"Cash"

    },


    note:{

        type:String,

        default:""

    },


    approvedBy:{

        type:String,

        default:"Admin"

    }


},


{

    timestamps:true,

    versionKey:false

}


);



module.exports = mongoose.model(
    "MemberExit",
    memberExitSchema
);