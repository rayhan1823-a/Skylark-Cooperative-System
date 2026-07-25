const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },

    phone:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },

    email:{
        type:String,
        default:"",
        trim:true
    },

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        enum:[
            "SUPER_ADMIN",
            "ADMIN",
            "STAFF",
            "MEMBER"
        ],
        default:"MEMBER"
    },

    memberId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Member",
        default:null
    },

    status:{
        type:String,
        enum:[
            "Active",
            "Inactive"
        ],
        default:"Active"
    }
},
{
    timestamps:true
}
);

module.exports = mongoose.model(
"User",
UserSchema
);