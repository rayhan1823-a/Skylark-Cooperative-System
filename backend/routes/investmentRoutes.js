const express = require('express');
const router = express.Router();
const { 
  createInvestment, 
  getInvestments, 
  updateInvestment 
} = require('../controllers/investmentController');

// ইনভেস্টমেন্ট তৈরি করা
router.post('/', createInvestment);

// সমস্ত ইনভেস্টমেন্ট দেখা
router.get('/', getInvestments);

// ইনভেস্টমেন্ট আপডেট বা এডিট করা (নতুন যুক্ত করা হয়েছে)
router.put('/:id', updateInvestment);

module.exports = router;