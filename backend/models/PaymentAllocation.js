const mongoose = require("mongoose");


const paymentAllocationSchema = new mongoose.Schema(

{

    // ======================================
    // Member Reference
    // ======================================

    member:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Member",
        required:[true,"Member is required"],
        index:true
    },



    // ======================================
    // Payment Reference
    // ======================================

    payment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Payment",
        default:null,
        index:true
    },



    // ======================================
    // Monthly Period
    // ======================================

    year:{
        type:Number,
        required:[true,"Year is required"],
        min:2023,
        max:2100,
        index:true
    },


    month:{
        type:Number,
        required:[true,"Month is required"],
        min:1,
        max:12,
        index:true
    },



    // ======================================
    // Monthly Required Amount
    // ======================================

    monthlyAmount:{
        type:Number,
        required:true,
        default:0,
        min:0
    },



    // ======================================
    // Paid Amount
    // ======================================

    paidAmount:{
        type:Number,
        default:0,
        min:0
    },



    // ======================================
    // Remaining Due
    // ======================================

    dueAmount:{
        type:Number,
        default:function(){

            return this.monthlyAmount - this.paidAmount;

        },

        min:0
    },



    // ======================================
    // Penalty
    // ======================================

    penalty:{
        type:Number,
        default:0,
        min:0
    },


    penaltyWaived:{
        type:Number,
        default:0,
        min:0
    },



    // ======================================
    // Advance Payment
    // ======================================

    isAdvance:{
        type:Boolean,
        default:false
    },



    // ======================================
    // Remarks
    // ======================================

    remarks:{
        type:String,
        trim:true,
        default:""
    }



},

{
    timestamps:true,
    versionKey:false
}

);




// ======================================
// Prevent Duplicate Monthly Record
// ======================================

paymentAllocationSchema.index(

{
    member:1,
    year:1,
    month:1
},

{
    unique:true
}

);





module.exports =
mongoose.model(
    "PaymentAllocation",
    paymentAllocationSchema
);