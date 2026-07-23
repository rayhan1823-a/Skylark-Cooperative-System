// ======================================
// Imports
// ======================================

const mongoose = require("mongoose");

const Member = require("../models/Member");

const {
    generateMemberAllocation
} = require("../services/paymentAllocator");




// ======================================
// Get Member Payment Allocation
// ======================================

const getMemberAllocation = async (req, res) => {


    try {


        const { id } = req.params;



        // ==========================
        // Validate Member ID
        // ==========================

        if(!mongoose.Types.ObjectId.isValid(id)){


            return res.status(400).json({

                success:false,

                message:"Invalid Member ID"

            });


        }






        // ==========================
        // Find Member
        // ==========================

        const member =
        await Member.findById(id);





        if(!member){


            return res.status(404).json({

                success:false,

                message:"Member not found"

            });


        }







        // ==========================
        // Generate Allocation
        // ==========================

        const allocation =
        await generateMemberAllocation(
            member._id
        );







        // ==========================
        // Response
        // ==========================

        return res.status(200).json({


            success:true,


            member:{


                _id:member._id,

                memberId:member.memberId,

                name:member.name,

                phone:member.phone


            },


            data:allocation



        });







    }
    catch(error){



        console.log(

            "Payment Allocation Controller Error:",
            error.message

        );



        return res.status(500).json({


            success:false,


            message:"Server Error",


            error:error.message



        });



    }



};







// ======================================
// Export
// ======================================

module.exports = {


    getMemberAllocation


};