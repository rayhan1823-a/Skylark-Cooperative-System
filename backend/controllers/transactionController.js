const Transaction = require("../models/Transaction");


// ======================================
// Add Transaction
// ======================================

const addTransaction = async (req, res) => {

    try {

        const {
            type,
            category,
            memberId,
            amount,
            paymentMethod,
            description,
            date,
            createdBy
        } = req.body;

        if(
            !type ||
            !category ||
            !amount
        ){

            return res.status(400).json({

                success:false,

                message:
                "Type, Category and Amount are required."

            });

        }

        const transaction = await Transaction.create({

            type,

            category,

            memberId:
            memberId || null,

            amount,

            paymentMethod,

            description,

            date: date || Date.now(), // ডে트 না থাকলে বর্তমান ডেট নিবে

            createdBy

        });

        res.status(201).json({

            success:true,

            message:
            "Transaction added successfully",

            transaction

        });

    }
    catch(error){

        console.log(
            "Add Transaction Error:",
            error
        );

        res.status(500).json({

            success:false,

            message:
            "Server Error"

        });

    }

};


// ======================================
// Update / Edit Transaction (নতুন যোগ করা হলো)
// ======================================

const updateTransaction = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            type,
            category,
            memberId,
            amount,
            paymentMethod,
            description,
            date
        } = req.body;

        let transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        const updateData = {
            type: type || transaction.type,
            category: category || transaction.category,
            memberId: memberId !== undefined ? (memberId || null) : transaction.memberId,
            amount: amount !== undefined ? amount : transaction.amount,
            paymentMethod: paymentMethod || transaction.paymentMethod,
            description: description !== undefined ? description : transaction.description,
            date: date || transaction.date // নতুন ডেট ইনপুট পেলে তা আপডেট করবে
        };

        transaction = await Transaction.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            transaction
        });

    }
    catch (error) {

        console.log(
            "Update Transaction Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

};


// ======================================
// Get All Transactions
// ======================================

const getTransactions = async(req,res)=>{

    try{

        const transactions =
        await Transaction.find()

        .populate(
            "memberId",
            "memberId name phone"
        )

        .sort({
            createdAt:-1
        });

        res.status(200).json({

            success:true,

            count:
            transactions.length,

            transactions

        });

    }
    catch(error){

        console.log(
            "Get Transaction Error:",
            error
        );

        res.status(500).json({

            success:false,

            message:
            "Server Error"

        });

    }

};


// ======================================
// Transaction Summary
// ======================================

const getTransactionSummary = async(req,res)=>{

    try{

        const income =
        await Transaction.aggregate([

            {
                $match:{
                    type:"INCOME"
                }
            },

            {
                $group:{

                    _id:null,

                    total:{
                        $sum:"$amount"
                    }

                }
            }

        ]);

        const expense =
        await Transaction.aggregate([

            {
                $match:{
                    type:"EXPENSE"
                }
            },

            {
                $group:{

                    _id:null,

                    total:{
                        $sum:"$amount"
                    }

                }
            }

        ]);

        const refund =
        await Transaction.aggregate([

            {
                $match:{
                    type:"REFUND"
                }
            },

            {
                $group:{

                    _id:null,

                    total:{
                        $sum:"$amount"
                    }

                }
            }

        ]);

        const totalIncome =
        income[0]?.total || 0;

        const totalExpense =
        expense[0]?.total || 0;

        const totalRefund =
        refund[0]?.total || 0;

        const balance =
        totalIncome -
        totalExpense -
        totalRefund;

        res.status(200).json({

            success:true,

            summary:{

                totalIncome,

                totalExpense,

                totalRefund,

                balance

            }

        });

    }
    catch(error){

        console.log(
            "Summary Error:",
            error
        );

        res.status(500).json({

            success:false,

            message:
            "Server Error"

        });

    }

};


// ======================================
// Delete Transaction
// ======================================

const deleteTransaction = async(req,res)=>{

    try{

        const {id}=req.params;

        const transaction =
        await Transaction.findById(id);

        if(!transaction){

            return res.status(404).json({

                success:false,

                message:
                "Transaction not found"

            });

        }

        await Transaction.findByIdAndDelete(id);

        res.status(200).json({

            success:true,

            message:
            "Transaction deleted"

        });

    }
    catch(error){

        res.status(500).json({

            success:false,

            message:
            "Server Error"

        });

    }

};


module.exports = {

    addTransaction,
    updateTransaction, // এখানে আপডেট কন্ট্রোলার যুক্ত করা হলো
    getTransactions,
    getTransactionSummary,
    deleteTransaction

};