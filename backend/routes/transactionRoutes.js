const express = require("express");

const router = express.Router();


const {

    addTransaction,

    updateTransaction, // নতুন এডিট কন্ট্রোলার এখানে যোগ করা হলো

    getTransactions,

    getTransactionSummary,

    deleteTransaction


} = require("../controllers/transactionController");




// ======================================
// Add Transaction
// POST /api/transactions
// ======================================

router.post(
    "/",
    addTransaction
);




// ======================================
// Transaction Summary
// GET /api/transactions/summary
// (এটি '/'-এর উপরে রাখা হয়েছে যেন সঠিকভাবে কাজ করে)
// ======================================

router.get(
    "/summary",
    getTransactionSummary
);




// ======================================
// Get All Transactions
// GET /api/transactions
// ======================================

router.get(
    "/",
    getTransactions
);




// ======================================
// Update Transaction
// PUT /api/transactions/:id
// (এটি নতুন যোগ করা হলো যাতে ডেটসহ অন্যান্য ফিল্ড এডিট করা যায়)
// ======================================

router.put(
    "/:id",
    updateTransaction
);




// ======================================
// Delete Transaction
// DELETE /api/transactions/:id
// ======================================

router.delete(
    "/:id",
    deleteTransaction
);





module.exports = router;