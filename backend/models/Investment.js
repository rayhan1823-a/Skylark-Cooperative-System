const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  investmentType: { 
    type: String, 
    enum: ['FDR', 'DPS', 'Sanchaypatra', 'Mutual Fund', 'Land / Property', 'Business Venture', 'Shares', 'Other'], 
    required: true 
  },
  institutionName: { type: String, required: true }, // প্রতিষ্ঠান, প্রপার্টি বা ব্যবসার নাম
  accountOrCertNo: { type: String }, // অ্যাকাউন্ট, সার্টিফিকেট বা দলিল নম্বর (অপশনাল করা হয়েছে)
  principalAmount: { type: Number, required: true },  // মূল বিনিয়োগের পরিমাণ
  interestRate: { type: Number },     // সুদের হার (%) (প্রয়োজন সাপেক্ষে অপশনাল)
  startDate: { type: Date, required: true },          // শুরুর তারিখ
  maturityDate: { type: Date },       // মেয়াদ শেষের তারিখ (প্রয়োজন সাপেক্ষে অপশনাল)
  maturityAmount: { type: Number },                   // মেয়াদ শেষে সম্ভাব্য প্রাপ্তি বা বর্তমান মূল্য
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Investment', investmentSchema);