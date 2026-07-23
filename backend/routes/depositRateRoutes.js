const express = require("express");
const router = express.Router();

const {
  getDepositRates,
  createDepositRate,
  updateDepositRate,
  deleteDepositRate,
} = require("../controllers/depositRateController");

// ======================================
// Deposit Rate Routes
// ======================================

// Get All Deposit Rates
router.get("/", getDepositRates);

// Create Deposit Rate
router.post("/", createDepositRate);

// Update Deposit Rate
router.put("/:id", updateDepositRate);

// Delete Deposit Rate
router.delete("/:id", deleteDepositRate);

module.exports = router;