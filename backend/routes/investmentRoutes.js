const express = require('express');
const router = express.Router();
const { createInvestment, getInvestments } = require('../controllers/investmentController');

router.post('/', createInvestment);
router.get('/', getInvestments);

module.exports = router;