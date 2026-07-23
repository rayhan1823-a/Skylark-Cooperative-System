const mongoose = require("mongoose");

const Member = require("../models/Member");
const MemberExit = require("../models/MemberExit");
const Transaction = require("../models/Transaction");



// ======================================
// Create Member Exit
// ======================================

const memberExit = async (req, res) => {

    try {


        const {

            memberId,
            totalDeposit,
            profitAmount,
            penaltyAmount,
            refundAmount,
            paymentMethod,
            note,
            approvedBy,
            exitReason

        } = req.body || {};




        // Validation

        if(!memberId || refundAmount === undefined){

            return res.status(400).json({

                success:false,

                message:
                "Member ID and Refund Amount are required"

            });

        }




        // Find Member

        let member;



        if(mongoose.Types.ObjectId.isValid(memberId)){


            member = await Member.findOne({

                $or:[

                    {
                        _id:memberId
                    },

                    {
                        memberId:memberId
                    }

                ]

            });



        }else{


            member = await Member.findOne({

                memberId:memberId

            });


        }






        if(!member){


            return res.status(404).json({

                success:false,

                message:
                "Member not found"

            });


        }





        // Already Exit Check

        if(member.status === "Exited"){


            return res.status(400).json({

                success:false,

                message:
                "Member already exited"

            });


        }





        // ==============================
        // Create Exit Record
        // ==============================


        const exitRecord = await MemberExit.create({


            memberId:member._id,


            totalDeposit:
            Number(totalDeposit) || 0,


            profitAmount:
            Number(profitAmount) || 0,


            penaltyAmount:
            Number(penaltyAmount) || 0,


            refundAmount:
            Number(refundAmount),


            paymentMethod:
            paymentMethod || "Cash",


            note:
            note || "",


            approvedBy:
            approvedBy || "Admin",


            exitReason:
            exitReason || ""

        });








        // ==============================
        // Update Member
        // ==============================


        await Member.findByIdAndUpdate(

            member._id,

            {

                status:"Exited",

                exitDate:new Date(),

                exitReason:
                exitReason || "",

                refundAmount:
                Number(refundAmount)

            },

            {
                new:true
            }

        );





        // Get Updated Member

        const updatedMember =
        await Member.findById(member._id);








        // ==============================
        // Create Transaction
        // ==============================


        const transaction = await Transaction.create({


            memberId:
            member._id,


            type:
            "EXPENSE",


            category:
            "Member Exit Refund",


            amount:
            Number(refundAmount),


            paymentMethod:
            paymentMethod || "Cash",


            description:
            `Refund paid to ${member.name}`,


            createdBy:
            approvedBy || "Admin"


        });









        return res.status(201).json({

            success:true,


            message:
            "Member exit completed successfully",



            data:{


                member:updatedMember,


                exitRecord,


                transaction


            }


        });





    }
    catch(error){


        console.error(
            "Member Exit Error:",
            error
        );



        return res.status(500).json({


            success:false,


            message:
            "Server Error",


            error:
            error.message


        });


    }

};









// ======================================
// Get All Member Exit
// ======================================

const getMemberExits = async(req,res)=>{


    try{


        const exits = await MemberExit.find()

        .populate(

            "memberId",

            "memberId name phone status"

        )

        .sort({

            createdAt:-1

        });



        res.status(200).json({

            success:true,

            count:exits.length,

            exits

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:
            "Server Error",

            error:
            error.message

        });


    }


};









// ======================================
// Get Single Exit
// ======================================

const getMemberExit = async(req,res)=>{


    try{


        const exit =
        await MemberExit.findById(req.params.id)

        .populate("memberId");



        if(!exit){


            return res.status(404).json({

                success:false,

                message:
                "Exit record not found"

            });


        }



        res.status(200).json({

            success:true,

            exit

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:
            "Server Error",

            error:
            error.message

        });


    }


};








module.exports = {


    memberExit,

    getMemberExits,

    getMemberExit


};