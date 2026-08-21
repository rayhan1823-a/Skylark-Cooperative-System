const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getCheques,
  getChequeById,
  addCheque,
  updateCheque,
  deleteCheque,
  getChequeSummary,
} = require("../controllers/chequeController");

// ======================================
// General Routes
// ======================================

router.get("/summary", authMiddleware, getChequeSummary);

router.get("/", authMiddleware, getCheques);

router.get("/:id", authMiddleware, getChequeById);

// ======================================
// Super Admin Routes
// ======================================

router.post("/", authMiddleware, addCheque);

router.put("/:id", authMiddleware, updateCheque);

router.delete("/:id", authMiddleware, deleteCheque);

module.exports = router;