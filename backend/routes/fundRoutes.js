const express = require("express");

const router = express.Router();

// ======================================
// Controllers
// ======================================

const {

    addFundTransaction,

    getFundTransactions,

    getFundTransactionById,

    searchFundTransactions,

    updateFundTransaction,

    deleteFundTransaction,

    getFundSummary,

    filterFundTransactionsByDate

} = require("../controllers/fundController");


// ======================================
// Add Fund Transaction
// POST: /api/funds
// ======================================

router.post(
    "/",
    addFundTransaction
);


// ======================================
// Fund Summary
// GET: /api/funds/summary
// ======================================

router.get(
    "/summary",
    getFundSummary
);


// ======================================
// Search Transactions
// GET: /api/funds/search?keyword=cash
// ======================================

router.get(
    "/search",
    searchFundTransactions
);


// ======================================
// Filter Transactions By Date
// GET: /api/funds/filter?from=2026-01-01&to=2026-12-31
// ======================================

router.get(
    "/filter",
    filterFundTransactionsByDate
);


// ======================================
// Get All Transactions
// GET: /api/funds
// ======================================

router.get(
    "/",
    getFundTransactions
);


// ======================================
// Get Single Transaction
// GET: /api/funds/:id
// ======================================

router.get(
    "/:id",
    getFundTransactionById
);


// ======================================
// Update Transaction
// PUT: /api/funds/:id
// ======================================

router.put(
    "/:id",
    updateFundTransaction
);


// ======================================
// Delete Transaction
// DELETE: /api/funds/:id
// ======================================

router.delete(
    "/:id",
    deleteFundTransaction
);


// ======================================
// Export Router
// ======================================

module.exports = router;