const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  investmentType: { 
    type: String, 
    enum: ['FDR', 'DPS', 'Sanchaypatra', 'Mutual Fund'], 
    required: true 
  },
  institutionName: { type: String, required: true }, // ব্যাংক বা আর্থিক প্রতিষ্ঠানের নাম
  accountOrCertNo: { type: String, required: true }, // একাউন্ট বা সার্টিফিকেট নম্বর
  principalAmount: { type: Number, required: true },  // মূল বিনিয়োগের পরিমাণ
  interestRate: { type: Number, required: true },     // সুদের হার (%)
  startDate: { type: Date, required: true },          // শুরুর তারিখ
  maturityDate: { type: Date, required: true },       // মেয়াদ শেষের তারিখ
  maturityAmount: { type: Number },                   // মেয়াদ শেষে সম্ভাব্য প্রাপ্তি
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Investment', investmentSchema);