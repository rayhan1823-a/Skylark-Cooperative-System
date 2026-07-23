const express = require("express");

const router = express.Router();


const {

    addTransaction,

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
// Get All Transactions
// GET /api/transactions
// ======================================

router.get(
    "/",
    getTransactions
);




// ======================================
// Transaction Summary
// GET /api/transactions/summary
// ======================================

router.get(
    "/summary",
    getTransactionSummary
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