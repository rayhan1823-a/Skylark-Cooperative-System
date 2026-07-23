const express = require("express");
const router = express.Router();
const { 
  getWithdrawals, 
  createWithdrawal, 
  deleteWithdrawal 
} = require("../controllers/withdrawalController");

// Get all withdrawals history
router.get("/", getWithdrawals);

// Create a new withdrawal record
router.post("/", createWithdrawal);

// Delete a withdrawal record (Super Admin only)
router.delete("/:id", deleteWithdrawal);

module.exports = router;