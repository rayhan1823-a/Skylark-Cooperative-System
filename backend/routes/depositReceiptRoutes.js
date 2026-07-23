// ======================================
// Import
// ======================================
const express = require("express");
const router = express.Router();
const { getDepositReceipt } = require("../controllers/depositReceiptController");

// ======================================
// Get Deposit Receipt
// authMiddleware সরিয়ে দেওয়া হয়েছে যাতে সরাসরি ডাউনলোড করা যায়
// ======================================

router.get("/:id", getDepositReceipt);

// ======================================
// Export
// ======================================
module.exports = router;