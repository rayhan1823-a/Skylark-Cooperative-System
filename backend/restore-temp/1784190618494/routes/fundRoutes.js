const express = require("express");

const router = express.Router();



const {

    addFundTransaction,

    getFundTransactions,

    getFundSummary


} = require("../controllers/fundController");





// ======================================
// Add Fund Transaction
// ======================================

router.post(
    "/",
    addFundTransaction
);





// ======================================
// Get All Transactions
// ======================================

router.get(
    "/",
    getFundTransactions
);





// ======================================
// Fund Summary
// ======================================

router.get(
    "/summary",
    getFundSummary
);





module.exports = router;